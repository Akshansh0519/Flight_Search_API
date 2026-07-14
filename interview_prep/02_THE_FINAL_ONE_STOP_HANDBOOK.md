# SkyElite Flights — The Final One-Stop Handbook
**Complete Route-by-Route, Module-by-Module, In-Depth Concepts, 1-Day Mastery Plan & Rapid Revision Flashcards**

---

## 📖 Table of Contents
1. **[Part 1: Route-by-Route & API Reference across all 4 Microservices](#part-1-route-by-route--api-reference)**
2. **[Part 2: Module-by-Module & exact Database Table Schemas](#part-2-module-by-module--database-schemas)**
3. **[Part 3: In-Depth Concepts Explained (`SELECT ... FOR UPDATE`, `JWT`, `RabbitMQ AMQP`, `Idempotency`)](#part-3-in-depth-concepts-explained)**
4. **[Part 4: The 1-Day Study & Mastery Schedule (Hour-by-Hour)](#part-4-1-day-study--mastery-schedule)**
5. **[Part 5: Rapid Revision Flashcards (Pre-Interview Quick Checks)](#part-5-rapid-revision-flashcards)**

---

## Part 1: Route-by-Route & API Reference

Our ecosystem routes through **Port 5000 (`API Gateway`)** or directly to individual microservices during internal communication. Here is every single API endpoint across the platform:

### 1. API Gateway Service (`Port 5000` - Base URL: `http://localhost:5000/api/v1`)
| HTTP Method | Route | Authentication | Upstream/Downstream Behavior |
|---|---|---|---|
| `POST` | `/user/signup` | Public | Hashes password (`bcrypt`), creates `User` & `User_Roles` (`customer`), returns JWT + user info. |
| `POST` | `/user/signin` | Public | Verifies email/password against MySQL, issues signed `JWT Bearer Token` (`jwt_token`). |
| `GET` | `/user/isAuthenticated`| `x-access-token` Header | Validates JWT token signature and checks if user is banned/deleted in database. |
| `GET` | `/user/isAdmin` | `x-access-token` Header | Checks if authenticated user possesses the `admin` role ID (`1`). |
| `ALL` | `/bookings/*` | `x-access-token` Header | Intercepts request, verifies JWT, extracts `userId`, and reverse-proxies to `http://localhost:4000/api/v1/bookings/*`. |
| `ALL` | `/flights/*` | Public / Admin | Reverse-proxies search and inventory requests directly to `http://localhost:3000/api/v1/flights/*`. |

---

### 2. Flight Search & Catalog Service (`Port 3000` - Base URL: `http://localhost:3000/api/v1`)
| HTTP Method | Route | Parameters / Payload | Purpose |
|---|---|---|---|
| `POST` | `/city` | `name` (string) | Creates a new city record (e.g., `Hyderabad`, `Jaipur`). |
| `GET` | `/city` | `filter` (optional query) | Retrieves all cities or searches by partial name. |
| `POST` | `/airports` | `name`, `code`, `address`, `cityId` | Registers a new airport (`HYD` Rajiv Gandhi Int., `JAI` Jaipur Int.). |
| `GET` | `/airports` | `cityId` | Returns all airports belonging to a particular city. |
| `POST` | `/flights` | `flightNumber`, `aeroplaneId`, `departureAirportId`, `arrivalAirportId`, `arrivalTime`, `departureTime`, `price`, `totalSeats` | Admin route: Schedules a new flight across airports. |
| `GET` | `/flights` | `departureAirportId`, `arrivalAirportId`, `price`, `sort` | Public catalog route: Returns filtered/sorted flights with live seat counts and airplane models. |
| `GET` | `/flights/:id` | `id` (Flight ID) | Retrieves exact details for a specific flight with eager-loaded `Airplanes` and `Airports` associations. |
| `PATCH` | `/flights/:id/seats`| `{ "seats": 1, "dec": true }` | **Internal Transactional Route**: Called by `Booking_Service`. Executes `SELECT ... FOR UPDATE` row lock, verifies seat availability, and atomically decrements/increments `totalSeats`. |

---

### 3. Booking & Transaction Service (`Port 4000` - Base URL: `http://localhost:4000/api/v1`)
| HTTP Method | Route | Headers Required | Payload / Parameters | Purpose |
|---|---|---|---|---|
| `POST` | `/bookings` | `Authorization: Bearer <JWT>`, `Idempotency-Key: <UUID>` | `{ "flightId": 258, "noOfSeats": 1 }` | **The Core Checkout Engine**: Verifies Idempotency Key, initiates MySQL transaction, calls `Port 3000` to lock row & decrement seat, inserts `Booking` (`status: booked`), saves Idempotency response, commits, and publishes RabbitMQ email event (`NOTIFICATION_QUEUE`). |
| `PATCH` | `/bookings/:id` | `Authorization: Bearer <JWT>` | `{ "status": "Cancelled" }` | Initiates rollback transaction: updates booking status, makes Axios `PATCH /flights/:id/seats` call (`dec: false`) to return seats to catalog, and commits. |

---

## Part 2: Module-by-Module & Database Schemas

We strictly enforce **Database-per-Service isolation** using `Sequelize` migrations across 4 independent MySQL databases.

### 🗄️ Database 1: `SkyElite_Auth_DB` (`Port 5000` - API Gateway)
Responsible for identity, authentication, and Role-Based Access Control (`RBAC`):
```sql
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Stored as bcrypt hash ($2b$08$...)
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE Roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE, -- 'admin', 'customer', 'airline_staff'
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE User_Roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE
);
```

---

### 🗄️ Database 2: `SkyElite_Flights_DB` (`Port 3000` - Flight Catalog)
Responsible for routes, scheduling, airplane configurations, and live seat inventory:
```sql
CREATE TABLE Cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE Airports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE, -- 'HYD', 'JAI', 'DEL'
  address VARCHAR(255),
  cityId INT NOT NULL,
  FOREIGN KEY (cityId) REFERENCES Cities(id) ON DELETE CASCADE
);

CREATE TABLE Airplanes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modelNumber VARCHAR(255) NOT NULL, -- 'Airbus A320neo', 'Boeing 737-800'
  capacity INT NOT NULL DEFAULT 180,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE Flights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flightNumber VARCHAR(255) NOT NULL, -- 'UK-5042'
  aeroplaneId INT NOT NULL,
  departureAirportId VARCHAR(10) NOT NULL,
  arrivalAirportId VARCHAR(10) NOT NULL,
  arrivalTime DATETIME NOT NULL,
  departureTime DATETIME NOT NULL,
  price INT NOT NULL,
  boardngGate VARCHAR(50) DEFAULT 'B1',
  totalSeats INT NOT NULL, -- Target of SELECT ... FOR UPDATE locks
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (aeroplaneId) REFERENCES Airplanes(id),
  FOREIGN KEY (departureAirportId) REFERENCES Airports(code),
  FOREIGN KEY (arrivalAirportId) REFERENCES Airports(code)
);
```

---

### 🗄️ Database 3: `SkyElite_Booking_DB` (`Port 4000` - Bookings & Idempotency)
Responsible for ACID reservations and network retry duplicate protection:
```sql
CREATE TABLE Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flightId INT NOT NULL,
  userId INT NOT NULL,
  status ENUM('InProcess', 'booked', 'Cancelled') DEFAULT 'InProcess',
  noOfSeats INT NOT NULL DEFAULT 1,
  totalCost INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IdempotencyKeys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE, -- Client-generated UUID string
  response JSON, -- Stores cached 201 Created response for instant retry replay
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

---

### 🗄️ Database 4: `SkyElite_Notification_DB` (`Port 3002` - Email Audit Log)
Responsible for tracking dispatched E-Tickets before Nodemailer execution:
```sql
CREATE TABLE Tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  recepientEmail VARCHAR(255) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

---

## Part 3: In-Depth Concepts Explained

### 1. The Engineering behind `SELECT ... FOR UPDATE` (Pessimistic Row Locking)
In standard SQL queries (`SELECT * FROM Flights WHERE id = 258`), MySQL uses **Non-Locking Consistent Reads (MVCC)**. Multiple users reading at the same instant all see `totalSeats = 1`.
When we append `FOR UPDATE` inside a `START TRANSACTION` block:
```sql
START TRANSACTION;
SELECT * FROM Flights WHERE id = 258 FOR UPDATE;
-- [ROW LOCKED IN INNODB ENGINE VIA INDEX RECORD LOCK]
UPDATE Flights SET totalSeats = totalSeats - 1 WHERE id = 258;
COMMIT; -- [LOCK RELEASED]
```
* **How InnoDB locks it**: MySQL applies an exclusive record-level lock (`X Lock`) on the primary key index (`id = 258`).
* **What happens to User B**: If User B attempts to execute `SELECT ... FOR UPDATE` on `id = 258` before User A executes `COMMIT` or `ROLLBACK`, User B's database thread pauses in a **Wait Queue** (up to `innodb_lock_wait_timeout`, usually 50 seconds).
* **Guaranteed Safety**: Once User A commits, User B's lock request wakes up, reads the fresh value (`totalSeats = 0`), detects `totalSeats < noOfSeats`, and cleanly aborts without overbooking.

---

### 2. JSON Web Token (`JWT`) Middleware Mechanics at the Gateway
When the API Gateway (`Port 5000`) receives an authorization request:
```javascript
// Step 1: Extract header
const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

// Step 2: Cryptographic Signature Verification
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) return res.status(401).json({ error: "Invalid or expired token" });
  
  // Step 3: Attach user claims to headers before proxying downstream!
  req.headers['x-user-id'] = decoded.id;
  req.headers['x-user-email'] = decoded.email;
  next();
});
```
* **Why this is powerful**: Downstream services (`Booking_Service` Port 4000) do not need complex database connections to verify authentication. They trust the headers forwarded by the internal API Gateway!

---

### 3. RabbitMQ AMQP (`Advanced Message Queuing Protocol`) Deep Dive
* **Exchange & Queue Assertion**: When `Notification-Service-Flights` boots up, it executes `channel.assertQueue('NOTIFICATION_QUEUE', { durable: true })`. `durable: true` ensures that if RabbitMQ restarts, the queue and its pending messages survive on disk (`Erlang Mnesia DB`).
* **Manual Acknowledgments (`{ noAck: false }`)**:
  By default, message brokers delete messages immediately upon delivery (`Auto Ack`). If Nodemailer crashes halfway through sending an email due to a network glitch, the ticket is lost.
  In our service, we set `noAck: false`. RabbitMQ keeps the message in an `Unacknowledged` state:
  ```javascript
  channel.consume('NOTIFICATION_QUEUE', async (msg) => {
    try {
      await sendEmail(JSON.parse(msg.content.toString()));
      channel.ack(msg); // Only remove from queue after successful SMTP delivery!
    } catch (error) {
      channel.nack(msg, false, true); // Re-queue message for automatic retry!
    }
  }, { noAck: false });
  ```

---

## Part 4: 1-Day Study & Mastery Schedule (Hour-by-Hour)

Follow this strict 6-hour intensive itinerary the day before your technical interview:

| Time | Module Focus | Action Checklist |
|---|---|---|
| **09:00 - 10:00 AM** | **High-Level Architecture & Analogies** | Read Section 1, 2, and 10 of `01_MASTER_INTERVIEW_PREP_GUIDE.md`. Practice explaining the Airport Terminal analogy aloud without looking at your notes. |
| **10:00 - 11:30 AM** | **ACID Transactions & Row Locking** | Open `Booking_Service/src/services/booking-service.js` and `Flights_Booking_Service/src/repository/flight-repository.js`. Trace exact `sequelize.transaction()` and `PATCH /flights/:id/seats` logic. |
| **11:30 - 12:30 PM** | **Idempotency & Network Resilience** | Study `IdempotencyKeys` table schema. Explain out loud why double-clicking "Confirm Pay" or Wi-Fi timeouts require idempotency headers. |
| **12:30 - 01:30 PM** | *Lunch Break & Mental Consolidation* | Relax your mind. |
| **01:30 - 02:30 PM** | **RabbitMQ Asynchronous Pipeline** | Open `Notification-Service-Flights/src/index.js`. Trace `channel.consume()`, `Nodemailer` execution, and `channel.ack(msg)` manual acknowledgments. |
| **02:30 - 03:30 PM** | **Gateway Security & Next.js Reactivity**| Study `Navbar.tsx` (`auth_change` event dispatch) and `Api_gateway_flights` JWT/Rate Limiting middleware. |
| **03:30 - 04:30 PM** | **Mock Interview Walkthrough Practice**| Stand up and speak the **3-5 Minute Master Walkthrough** (from Guide #1) aloud to a mirror or voice recorder 3 times until completely natural. |

---

## Part 5: Rapid Revision Flashcards (Pre-Interview Quick Checks)

Use these quick Q&A flashcards during your morning commute or right before jumping on the interview video call:

* **⚡ Q: How many microservices are in your project?**
  * **A:** **4 distinct microservices** + 1 Next.js SPA: API Gateway (`Port 5000`), Flight Search (`Port 3000`), Booking (`Port 4000`), and Notification (`Port 3002`).
* **⚡ Q: How do you prevent overbooking when 2 users book the last seat at the exact same millisecond?**
  * **A:** Using pessimistic MySQL row-locking via `SELECT ... FOR UPDATE` inside a Sequelize transaction (`LOCK.UPDATE`). The second request must wait in queue until the first commits or rolls back.
* **⚡ Q: Why did you separate Flight Search and Booking into two different databases (`Port 3000` and `4000`)?**
  * **A:** Because flight searches are 95% high-frequency read traffic. Isolating them prevents high-volume catalog queries from locking tables or slowing down write-heavy, ACID-critical checkout transactions.
* **⚡ Q: How do you prevent double-charging if a user's network drops during checkout and they click retry?**
  * **A:** Using an `Idempotency-Key` header verified against our `IdempotencyKeys` table. If the key exists, we replay the cached JSON response (`201 Created`) without re-executing the booking logic.
* **⚡ Q: Why use RabbitMQ instead of calling the email notification service directly via Axios?**
  * **A:** To decouple latency and eliminate single points of failure. SMTP servers take 2-4 seconds to respond. By publishing to RabbitMQ (`NOTIFICATION_QUEUE`), the booking API responds in `<50ms`, and if the email service crashes, RabbitMQ durably stores the message until recovery (`durable: true`, `noAck: false`).
* **⚡ Q: How is user authentication checked without querying the database on every microservice?**
  * **A:** Stateless **JSON Web Tokens (`JWT`)**. The API Gateway (`Port 5000`) cryptographically verifies the token signature (`jwt.verify`), extracts user claims, and injects them into downstream HTTP headers (`x-user-id`, `x-user-email`).
