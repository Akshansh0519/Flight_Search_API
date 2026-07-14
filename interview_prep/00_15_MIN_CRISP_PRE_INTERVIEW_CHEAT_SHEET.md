# ⚡ 15-Minute Super-Crisp Pre-Interview Cheat Sheet
**SkyElite Flights — Distributed 4-Microservice Airline Reservation Engine (`Node.js`, `Express`, `Sequelize`, `MySQL`, `RabbitMQ`, `Next.js 16`)**

> **⏱️ Read Time:** 15–20 Minutes  
> **🎯 Purpose:** Read this right before stepping into your technical interview to warm up your engineering terminology, lock in your walkthrough scripts, and prepare for rapid-fire technical grilling.

---

## 1. 🚀 The 60-Second Golden Intro (Say This First!)

When the interviewer asks: **"Tell me about a complex technical project you built."**

> *"I engineered **SkyElite Flights**, a distributed **4-microservice airline reservation platform** built on Node.js, Express, Sequelize, MySQL, and RabbitMQ, connected to a reactive Next.js 16 single-page application.*
>
> *When designing a commercial flight ticketing engine, the most critical engineering bottleneck is **concurrency and race conditions**. If a flight has 1 seat remaining and 500 users click 'Pay' simultaneously, a traditional monolithic CRUD app will read `totalSeats = 1` across multiple threads and severely overbook the airplane.*
>
> *I architected SkyElite specifically to solve high-concurrency seat checkout and network resilience by partitioning the system across **4 specialized microservice domains**:*
> 1. *An **API Gateway (`Port 5000`)** for centralized `express-rate-limit` DDoS protection and stateless JSON Web Token (`JWT`) authentication.*
> 2. *A read-heavy **Flight Catalog Service (`Port 3000`)** running on its own MySQL instance to serve high-frequency search traffic without locking transactional tables.*
> 3. *A write-heavy **Booking & Idempotency Engine (`Port 4000`)** where I implemented **ACID MySQL row-locking (`SELECT ... FOR UPDATE`)** inside Sequelize transactions to guarantee atomic seat inventory decrements, paired with an **Idempotency Key (`IdempotencyKeys` table)** layer to intercept network retries and eliminate double-charging.*
> 4. *An asynchronous **RabbitMQ Event Consumer (`Port 3002`)** that queues booking payloads (`NOTIFICATION_QUEUE`) and dispatches HTML E-Tickets via Nodemailer in the background, slashing checkout API latency from **4 seconds down to 50 milliseconds** while guaranteeing zero dropped emails via manual AMQP acknowledgments (`channel.ack`)."*

---

## 2. 🏛️ Architectural Glance Box (The 4 Microservices)

| Microservice | Folder | Port | Key MySQL Tables | Core Engineering Purpose |
|---|---|---|---|---|
| **API Gateway** | `Api_gateway_flights/` | `5000` | `Users`, `Roles`, `User_Roles` | **Security & Reverse Proxy**: Hashes passwords (`bcrypt`), checks rate limits (`max: 100/15m`), issues/verifies JWTs (`jwt.verify`), and injects `x-user-id` headers downstream. |
| **Flight Catalog** | `Flights_Booking_Service/` | `3000` | `Flights`, `Airports`, `Cities`, `Airplanes` | **Read-Heavy Inventory**: Manages global routes and airplane capacities. Exposes transactional `PATCH /flights/:id/seats` endpoint for row locks. |
| **Booking Engine**| `Booking_Service/` | `4000` | `Bookings`, `IdempotencyKeys` | **Write-Heavy ACID Vault**: Enforces Idempotency Key checks, opens `sequelize.transaction()`, calls `Port 3000` to lock/decrement seats, and emits RabbitMQ events. |
| **Notification** | `Notification-Service-Flights/`| `3002` | `Tickets` (Email Audit Log) | **Decoupled AMQP Worker**: Consumes `NOTIFICATION_QUEUE` with `durable: true` and `noAck: false`. Audits to MySQL and sends Nodemailer E-Tickets. |
| **Frontend SPA** | `frontend/` | `3001` | *(Local Storage / State)* | **Reactive UI**: Next.js 16 Cyberpunk UI. Dispatches custom browser `window.dispatchEvent(new Event("auth_change"))` for instant navbar state sync. |

---

## 3. 🔥 The 4 Hardest Technical Concepts (Explained Simply)

### 1️⃣ ACID Row-Locking (`SELECT ... FOR UPDATE`)
* **Why it's asked:** Interviewers want to see if you understand database locking vs. application-level checks.
* **What happens in plain English:** When `Booking_Service` (`Port 4000`) starts a checkout, it calls `PATCH /flights/258/seats` on `Port 3000`. Inside Sequelize, we pass `{ lock: true }`. This executes:
  ```sql
  START TRANSACTION;
  SELECT * FROM Flights WHERE id = 258 FOR UPDATE;
  ```
* **The Mechanics:** MySQL `InnoDB` places an exclusive **Record Lock (`X Lock`)** on primary key index `id = 258`. If a competing checkout thread (`User B`) tries to read or modify row `258` at that exact millisecond, **MySQL halts User B in a wait queue (`Wait Queue`)**. User B cannot touch the row until User A executes `COMMIT` or `ROLLBACK`. Once User A decrements `totalSeats` from `1 to 0` and commits, User B wakes up, sees `0 seats`, and cleanly throws a `400 Flight Full` error without overbooking!

---

### 2️⃣ Idempotency Keys (Network Retry & Double-Charge Protection)
* **Why it's asked:** In real-world e-commerce, Wi-Fi drops halfway through payment. How do you prevent charging twice when the user clicks retry?
* **What happens in plain English:** The frontend generates a unique UUID header (`Idempotency-Key: skyelite-uuid`). Before `BookingService.createBooking()` touches any seats or money, it queries the `IdempotencyKeys` table:
  ```javascript
  const existingKey = await IdempotencyRepository.get(idempotencyKey);
  if (existingKey && existingKey.response) {
    // Return cached 201 Created receipt instantly! ZERO double charging!
    return res.status(200).json(JSON.parse(existingKey.response));
  }
  ```
  Only if the key is brand new does the transaction run, create the booking, save the JSON response string into the `IdempotencyKeys` record, and commit.

---

### 3️⃣ Asynchronous AMQP Decoupling (`RabbitMQ`)
* **Why it's asked:** Why didn't you just do `axios.post('http://localhost:3002/send-email')` right after creating the booking?
* **What happens in plain English:** Sending an email over SMTP (`Nodemailer`) takes **2 to 4 seconds**. If `Booking_Service` called `Notification_Service` synchronously over HTTP, the checkout spinner would freeze for 4 seconds! Worse, if Gmail's SMTP server went down for 10 minutes, the HTTP call would fail (`500 Error`), and the user's booking would roll back after payment!
* **The RabbitMQ Fix:** By publishing the booking payload to `NOTIFICATION_QUEUE`, `Booking_Service` completes in **`<5ms`** (`201 Created`). The standalone `Notification-Service-Flights` consumes the message in the background.

---

### 4️⃣ Manual AMQP Acknowledgments (`channel.ack` vs `channel.nack`)
* **Why it's asked:** What happens if `Notification-Service-Flights` (`Port 3002`) crashes right in the middle of sending an email? Does the user lose their E-Ticket forever?
* **What happens in plain English:** By default, brokers use `Auto Ack` (deleting messages immediately upon delivery). We set `{ noAck: false }`. RabbitMQ keeps the message labeled as **`Unacknowledged`** on disk (`durable: true`).
  ```javascript
  channel.consume('NOTIFICATION_QUEUE', async (msg) => {
    try {
      await EmailService.sendEmail(JSON.parse(msg.content.toString()));
      channel.ack(msg); // ONLY remove from disk after Nodemailer reports success!
    } catch (err) {
      channel.nack(msg, false, true); // Put message back in queue for automatic retry!
    }
  }, { noAck: false });
  ```
  If our Node process dies or SMTP times out, `channel.nack()` guarantees the ticket is re-queued and delivered automatically upon server recovery.

---

## 4. ⚔️ Rapid-Fire Attack & Defense (The Top 6 Grilling Questions)

### ❓ Attack 1: "Why did you choose MySQL/Sequelize over MongoDB/NoSQL?"
> **Your Defense:** *"Because an airline reservation system is fundamentally relational and transactional. Flights reference Airplanes (`aeroplaneId`), Airports reference Cities (`cityId`), and Bookings reference Users and Flights. If an airport code changes, relational cascading (`ON DELETE CASCADE`) prevents data corruption. Most importantly, MySQL `InnoDB` natively guarantees explicit row-level locking (`SELECT ... FOR UPDATE`) across transactions (`START TRANSACTION`), which allowed me to strictly prevent inventory race conditions without complex application-level distributed mutexes."*

---

### ❓ Attack 2: "Why didn't you just use Redis distributed locks (`Redlock`) instead of MySQL `FOR UPDATE`?"
> **Your Defense:** *"Redis distributed locks (`Redlock`) are excellent for caching or high-speed rate limiting, but for critical financial inventory like airline seats, Redis introduces two risks: first, if a Redis primary node crashes before replicating the lock to a replica (`split-brain`), two cashiers can acquire the same lock simultaneously. Second, a Redis lock is separate from the actual MySQL transaction boundary. By using **MySQL `FOR UPDATE`**, the seat lock and the actual `totalSeats - 1` decrement occur inside the exact same atomic `InnoDB` transaction boundary. When the transaction commits or rolls back, the lock releases instantly."*

---

### ❓ Attack 3: "How does the API Gateway (`Port 5000`) authenticate requests without overloading your database?"
> **Your Defense:** *"We use stateless **JSON Web Tokens (`JWT`)**. When a user signs in (`POST /user/signin`), the Gateway queries MySQL once, verifies their `bcrypt` password hash, and signs a JWT (`jwt.sign`) containing their `id`, `email`, and `role`. For every subsequent request (`POST /bookings`), `AuthRequestValidators.validateUserAuth` cryptographically verifies the signature (`jwt.verify`). Because the signature is verified using our secret key (`process.env.JWT_SECRET`), the Gateway proves identity and injects `req.headers['x-user-id']` downstream **without executing a single database lookup**."*

---

### ❓ Attack 4: "What happens if `Booking_Service` locks the flight row on `Port 3000`, but `Booking_Service` crashes before inserting the `Bookings` record on `Port 4000`?"
> **Your Defense:** *"Because `Booking_Service` (`Port 4000`) wraps its execution block inside a `try/catch` with a `Sequelize` transaction (`t`). If any error occurs or if the `BookingRepository.create()` fails, the `catch` block fires `await t.rollback()`. Furthermore, if the `Booking_Service` Node process crashes outright, the TCP connection to MySQL drops. When MySQL `InnoDB` detects a dropped connection on an uncommitted transaction, it automatically rolls back all changes and immediately releases the `FOR UPDATE` row locks within `innodb_lock_wait_timeout`."*

---

### ❓ Attack 5: "Where is state managed across this 4-microservice architecture?"
> **Your Defense:** *"State is strictly partitioned across three tiers:*
> 1. ***Persistent Domain State:** Strictly isolated per service across 4 independent MySQL databases (`Auth_DB` Port 5000, `Flights_DB` Port 3000, `Booking_Service_DB` Port 4000, and `Notification_DB` Port 3002).*
> 2. ***Session / Identity State:** 100% stateless! Handled via signed JSON Web Tokens (`JWT Bearer Tokens`) passed in HTTP headers.*
> 3. ***Client UI State:** Handled in our Next.js 16 SPA (`Port 3001`) via React `useState`/`useEffect` hooks, `localStorage` (`jwt_token`, `skyelite_user_email`), and custom browser event dispatching (`window.dispatchEvent(new Event("auth_change"))`) to ensure instant UI reactivity across components."*

---

### ❓ Attack 6: "If you had another 2 weeks, how would you scale this architecture further?"
> **Your Defense:** *"I would implement four enterprise upgrades:*
> 1. ***Redis Caching on Flight Search (`Port 3000`):** Flight catalog queries (`GET /flights`) are 95% read traffic. Caching active flights in `Redis` drops search latency to `2ms` while using RabbitMQ events to evict cache keys whenever a seat is booked.*
> 2. ***Circuit Breakers (`Opossum` / `Resilience4j`):** Wrap our synchronous Axios calls from `Booking_Service` to `Flight Search` in a Circuit Breaker. If `Port 3000` times out 5 times consecutively, the breaker trips Open (`OPEN`) and instantly rejects checkouts with a clean fallback message instead of exhausting server thread pools.*
> 3. ***Event-Driven Saga Pattern:** Transition from synchronous Axios calls inside our checkout flow to a Choreographed Saga where payment capture and seat decrements emit `COMPENSATING_TRANSACTION` events to rollback cleanly across services if downstream steps fail.*
> 4. ***Kubernetes (`K8s`) Containerization:** Deploy all 4 services inside Docker pods with `HorizontalPodAutoscalers (HPA)` to auto-scale `Flight Search` (`Port 3000`) to 10 replicas during holiday traffic spikes while keeping `Booking` (`Port 4000`) stable."*

---

## 5. 🧠 Buzzword Power Dictionary (Drop These Phrases Naturally!)

* **Database-per-Service Pattern:** *"Each microservice owns its own isolated MySQL database schema, eliminating tight data coupling and allowing independent scaling."*
* **Pessimistic Row-Locking (`SELECT ... FOR UPDATE`):** *"Proactively locking specific database rows during a transaction to prevent concurrent threads from reading or modifying the inventory until commit."*
* **Idempotency Key Verification:** *"Ensuring that executing the same HTTP checkout request multiple times yields the exact same state and prevents duplicate credit card charges on network retries."*
* **Temporal Decoupling via AMQP (`RabbitMQ`):** *"Separating the fast checkout API (`Booking_Service`) from the slow, fault-prone email sending worker (`Notification_Service`) via durable message queues."*
* **Manual AMQP Acknowledgment (`channel.ack`):** *"Only telling the broker to delete a message from disk after the downstream task (`Nodemailer SMTP`) explicitly reports 100% success."*
* **Stateless Edge Reverse Proxy:** *"Using an Edge Gateway (`Port 5000`) to handle global `express-rate-limit` checks and JWT signature verification before proxying clean headers downstream."*

---

## 🏁 Final Mental Checklist Before You Walk In
1. Take a deep breath. You built this. You know how the pieces connect.
2. If asked *"Walk me through your project"*, speak with confidence using **Section 1 (The 60-Second Intro)**.
3. If grilled on concurrency, draw out the **Airport Analogy / Cashier Golden Key (`SELECT ... FOR UPDATE`)**.
4. If grilled on network failures, explain **Idempotency Keys (`IdempotencyKeys` table)** and **RabbitMQ (`channel.ack` / `nack`)**.
5. **You are ready. Go ace this interview! 🚀**
