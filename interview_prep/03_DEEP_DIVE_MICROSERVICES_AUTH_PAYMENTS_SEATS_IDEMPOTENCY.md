# SkyElite Flights — Engineering Deep Dive
**Granular Breakdown: Auth Mechanics, Payment & Idempotency Emulation, ACID Seat Holding, and Asynchronous AMQP Pipelines**

---

## 1. 🔐 Authentication & Edge Gateway Security (`Port 5000`)

### Why an Edge Gateway?
In a distributed microservice cluster, exposing individual domain ports (`3000`, `4000`, `3002`) directly to the public internet creates massive security vulnerabilities, CORS headaches, and duplicated authentication code across services.
Instead, we enforce that all public client traffic must pass through **`Api_gateway_flights` on Port 5000**.

### 1.1 Global Rate-Limiting (`express-rate-limit`)
To protect against Denial-of-Service (`DDoS`) attacks and credential stuffing on login endpoints, the Gateway initializes a rate limiter:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});

app.use(limiter);
```

### 1.2 Role-Based Access Control (`RBAC`) via MySQL
When `POST /api/v1/user/signup` is called, our `UserService` creates a secure identity:
1. **Password Hashing**: `bcrypt.hashSync(password, 8)` hashes the raw password using 8 rounds of salt before storing it inside the `Users` table (`$2b$08$...`).
2. **Role Assignment**: `UserRepository.create()` queries the `Roles` table for role `"customer"`, inserting a relational link into `User_Roles (`user_id`, `role_id`)`.
3. **JWT Token Issuance**: `jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' })` creates a stateless signed token.

### 1.3 Reverse Proxy & Header Injection (`http-proxy-middleware`)
When a user requests a protected booking endpoint (`POST /api/v1/bookings`), the Gateway intercepts the request using `AuthRequestValidators.validateUserAuth`:
```javascript
// Step 1: Verify JWT signature and expiration
const response = await UserService.isAuthenticated(req.headers['x-access-token']);
if (!response) {
  return res.status(401).json({ message: "User is not authenticated" });
}

// Step 2: Reverse Proxy to Booking Service (Port 4000)
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api/v1/bookings', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Securely attach authenticated identity headers downstream!
    proxyReq.setHeader('x-user-id', req.headers['x-user-id'] || response);
  }
}));
```

---

## 2. 💺 ACID Seat Holding & Concurrency Control (`Port 4000` & `Port 3000`)

### 2.1 The Race Condition Threat Model
Assume `Flight #258` (`HYD` ➔ `JAI`) has `totalSeats = 1`.
Imagine two cashiers (`Request A` and `Request B`) hit `Booking_Service` (`Port 4000`) within `2 milliseconds` of each other:
```
Time 0.001s: Request A queries Flight #258 -> totalSeats is 1. (Valid!)
Time 0.002s: Request B queries Flight #258 -> totalSeats is 1. (Valid!)
Time 0.005s: Request A decrements totalSeats -> totalSeats becomes 0.
Time 0.006s: Request B decrements totalSeats -> totalSeats becomes -1. [CRITICAL OVERBOOKING BUG!]
```

### 2.2 The Row-Locking Solution (`SELECT ... FOR UPDATE`)
To prevent this, `Booking_Service` initiates a multi-step atomic transaction:
1. `BookingController` invokes `BookingService.createBooking()`.
2. `BookingService` opens a local database transaction `const t = await sequelize.transaction();`.
3. It makes a synchronous Axios `PATCH` call to `Flight Search Service`: `http://localhost:3000/api/v1/flights/258/seats` with `{ seats: 1, dec: true }`.
4. Inside `FlightRepository.updateRemainingSeats()` (`Port 3000`), we execute:
   ```javascript
   const flight = await Flights.findByPk(flightId, {
     lock: true // Inside Sequelize, this compiles directly to `SELECT * FROM Flights WHERE id = 258 FOR UPDATE;`
   });
   ```
5. **The InnoDB Lock Mechanics**:
   * When `Request A` hits `lock: true`, MySQL places an exclusive index record lock on `id = 258`.
   * When `Request B` hits `lock: true` `1 millisecond later`, MySQL halts `Request B` in an execution wait queue. `Request B` **cannot read or write** row `258` until `Request A` releases the lock!
6. `Request A` checks `if (noOfSeats > flight.totalSeats) throw new AppError('Not enough seats');`. Since `1 <= 1`, it executes `flight.totalSeats -= 1` and saves to MySQL (`totalSeats = 0`).
7. `Booking_Service` (`Port 4000`) creates the `Booking` record (`status: 'booked'`) and executes `await t.commit();`. The `FOR UPDATE` lock is released!
8. `Request B` wakes up from the MySQL wait queue, reads the newly updated `flight.totalSeats = 0`, detects `1 > 0`, and throws an exception (`Not enough seats remaining`). `Request B` rolls back cleanly without overbooking!

---

## 3. 💳 Payment Simulation & Idempotency (`IdempotencyKeys` Table)

### 3.1 Why Idempotency is Mandatory in E-Commerce
When a passenger pays `₹5,700` for a ticket, three network hops occur:
`Browser` ➔ `API Gateway (Port 5000)` ➔ `Booking Service (Port 4000)`.
If `Booking_Service` successfully locks the seat, charges the credit card, and commits the database transaction, but **the router drops the HTTP response packet right before it reaches the user's browser**, the user sees a spinning loading bar or an error screen (`504 Gateway Timeout`).
Thinking the checkout failed, the user refreshes the page and clicks *"Confirm & Pay"* again!
Without an **Idempotency Check**, the server deducts a second seat and charges their bank account another `₹5,700`!

### 3.2 The Idempotency Key Architecture
Every checkout request must include a unique header (`Idempotency-Key`) generated by the client (`skyelite-timestamp-uuid`).
Inside `BookingService.createBooking()`:
```javascript
// Step 1: Check Idempotency Repository before doing ANY work!
const idempotencyKey = req.headers['idempotency-key'];
const existingKey = await IdempotencyRepository.get(idempotencyKey);

if (existingKey && existingKey.response) {
  // We already processed this exact request earlier!
  // Return the cached 201 Created JSON immediately without charging or locking!
  return res.status(200).json(JSON.parse(existingKey.response));
}

// Step 2: Create a placeholder Idempotency record inside the transaction
await IdempotencyRepository.create({
  key: idempotencyKey,
  response: null
}, { transaction: t });

// Step 3: Execute seat locking & booking creation...
const booking = await BookingRepository.create({ ... }, { transaction: t });

// Step 4: Save the successful JSON response string into the Idempotency record before committing!
await IdempotencyRepository.update(idempotencyKey, {
  response: JSON.stringify({ success: true, data: booking })
}, { transaction: t });

await t.commit();
```
Now, if the user or network retries the exact same checkout `100 times`, the server intercepts all 99 retries at `Step 1` and replays the cached receipt in `0 milliseconds`!

---

## 4. 📬 Asynchronous AMQP Messaging (`RabbitMQ` & `Port 3002`)

### 4.1 The Synchronous Email Anti-Pattern
In beginner tutorials, developers put `sendEmail()` directly inside their booking controller right before `res.status(201).json()`.
* **The Problem**: External SMTP servers (`Nodemailer` over Gmail/AWS SES/SendGrid) take `2,000ms to 4,000ms` to complete the SSL handshake and transmit the email body.
* **The Consequences**: The user's checkout button freezes for 4 seconds when the actual MySQL booking only took `25ms`. Furthermore, if the email server has a 5-minute outage, the API throws an unhandled error (`500 Internal Server Error`), causing the entire booking to roll back even though the payment succeeded!

### 4.2 Decoupling with RabbitMQ (`CloudAMQP`)
To decouple latency and guarantee `100% email delivery reliability`, we use an event-driven queue:
```javascript
// INSIDE BOOKING SERVICE (Port 4000) - After database transaction commits:
const { sendMessageToQueue } = require('../utils/messageQueue');

await sendMessageToQueue("NOTIFICATION_QUEUE", JSON.stringify({
  recepientEmail: user.email,
  subject: `✈️ SkyElite E-Ticket Confirmation | Booking #${booking.id}`,
  bookingDetails: { flightNumber, departure, arrival, price }
}));

// Respond instantly to client in <50ms!
return res.status(201).json({ success: true, data: booking });
```

### 4.3 Notification Worker Mechanics (`Port 3002`)
Our standalone **Notification Service** maintains a persistent AMQP connection:
```javascript
// INSIDE NOTIFICATION SERVICE (Port 3002):
const amqplib = require('amqplib');

async function subscribeEvents() {
  const connection = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
  const channel = await connection.createChannel();
  
  // Ensure queue exists on disk (`durable: true`)
  await channel.assertQueue('NOTIFICATION_QUEUE', { durable: true });
  
  // Consume messages with manual acknowledgment (`noAck: false`)
  channel.consume('NOTIFICATION_QUEUE', async (msg) => {
    try {
      const payload = JSON.parse(msg.content.toString());
      
      // Step 1: Audit log email intent into MySQL (`Tickets` table)
      await TicketRepository.create({
        recepientEmail: payload.recepientEmail,
        subject: payload.subject,
        content: payload.bookingDetails,
        status: 'PENDING'
      });
      
      // Step 2: Dispatch actual HTML E-Ticket via Nodemailer SMTP
      await EmailService.sendEmail(payload);
      
      // Step 3: Tell RabbitMQ the task succeeded so it can be safely removed from disk!
      channel.ack(msg);
    } catch (err) {
      console.error("Email delivery failed, re-queuing message...", err);
      // Negative Acknowledgment (`nack`): Tells RabbitMQ to put the message back in queue for retry!
      channel.nack(msg, false, true);
    }
  }, { noAck: false });
}
```
* **Why this is bulletproof**: If our Node.js notification server crashes or the SMTP server drops connection, `channel.nack()` ensures the message is never deleted from RabbitMQ. When the server recovers, it automatically consumes the pending message and delivers the E-Ticket without a single dropped passenger notification!
