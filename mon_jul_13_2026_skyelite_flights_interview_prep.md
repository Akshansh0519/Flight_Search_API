# SkyElite Flights — Master Technical Interview Preparation Syllabus (`mon_jul_13_2026`)
**Distributed 4-Microservice Airline Reservation Engine (`Node.js`, `Express`, `Sequelize`, `MySQL`, `RabbitMQ`, `Next.js 16`)**

---

## 🎯 Welcome to Your 5–6 Hour Complete Mastery Curriculum

This document serves as your **Master Syllabus and Executive Index**. If you built this project by following tutorials and experimenting with code (`vibe coding`), this 3-module curriculum inside your new `interview_prep/` directory is designed to take you from a basic code-level understanding to **complete engineering fluency** in 5 to 6 hours of focused study.

By the end of reading these modules, you will be able to confidently explain to senior technical interviewers exactly how all 4 microservices connect together, how ACID transactions and row-locking (`SELECT ... FOR UPDATE`) prevent concurrency bugs during peak checkouts, how Idempotency Keys protect against network retry charges, and how asynchronous event pipelines (`RabbitMQ`) keep API response latencies under 50 milliseconds.

---

## 📁 Curriculum Directory Structure (`interview_prep/`)

All study materials have been written and organized directly into the `interview_prep/` folder in your project root:

```
D:\TO DO THINGS\Developer\Flights_Booking_Service\
├── mon_jul_13_2026_skyelite_flights_interview_prep.md  <-- (This Index Document)
├── mon_jul_13_2026_shop_sense_interview_prep.md        <-- (Your existing ShopSense study hub)
└── interview_prep/
    ├── 01_MASTER_INTERVIEW_PREP_GUIDE.md               <-- Module 1: High-Level Architecture, 10 Core Q&A Sections & Walkthrough Scripts
    ├── 02_THE_FINAL_ONE_STOP_HANDBOOK.md               <-- Module 2: Route-by-Route, SQL Schemas, Rapid Flashcards & 1-Day Study Plan
    └── 03_DEEP_DIVE_MICROSERVICES_AUTH_PAYMENTS_SEATS_IDEMPOTENCY.md <-- Module 3: Granular Engineering Breakdown of ACID & AMQP
```

---

## 📖 Module Summaries & Suggested Study Roadmap

### 🏁 Module 1: Master Interview Preparation Guide (`~2 Hours`)
**Path:** [`interview_prep/01_MASTER_INTERVIEW_PREP_GUIDE.md`](file:///D:/TO%20DO%20THINGS/Developer/Flights_Booking_Service/interview_prep/01_MASTER_INTERVIEW_PREP_GUIDE.md)

**What you will master in Module 1:**
1. **Project Overview**: What exact concurrency problems occur in airline checkouts when 500 users attempt to book the last seat (`totalSeats = 1`) simultaneously.
2. **Architecture & Mental Picture**: Why we split the system into **4 specialized microservices** (`Port 5000` Gateway, `Port 3000` Catalog, `Port 4000` Booking, `Port 3002` Notification) instead of a monolithic CRUD app. Includes an intuitive **International Airport Terminal analogy** so you never have to memorize scripts.
3. **End-to-End Flow**: Step-by-step trace of a user searching for flights, authenticating with JWT, executing an ACID checkout, and receiving an asynchronous E-Ticket.
4. **Component & Service Breakdown**: Clear interaction matrix showing which service calls which (`Axios` vs `RabbitMQ`) and what data payloads flow between them.
5. **Ready-to-Speak Walkthrough Scripts**:
   * A natural, conversational **3–5 Minute Walkthrough** answering *"Walk me through your project."*
   * A high-impact **1-Minute Elevator Pitch** for quick recruiter introductions.
6. **Deep Dive Questions & Answers**: Follow-up interview responses explaining why MySQL was chosen over MongoDB, why RabbitMQ was chosen over direct Axios calls, where state is managed across stateless JWTs, and how Idempotency Keys work.
7. **The Most Challenging Part**: How we diagnosed and solved distributed race conditions across separate databases using synchronous row-locking checkpoints (`SELECT ... FOR UPDATE`).
8. **Unique Aspects & Resume Highlights**: How to frame your project using senior engineering terminology (`Pessimistic Locking`, `Database-per-Service`, `Decoupled AMQP Consumers`).
9. **Potential Future Improvements**: Impressive architectural proposals (Redis distributed caching, Kubernetes K8s horizontal pod auto-scaling, Saga pattern, Circuit Breakers).
10. **Socratic Teaching & Analogies**: Intuitive explanations of *why* every single component exists.

---

### 🚀 Module 2: The Final One-Stop Handbook (`~2 Hours`)
**Path:** [`interview_prep/02_THE_FINAL_ONE_STOP_HANDBOOK.md`](file:///D:/TO%20DO%20THINGS/Developer/Flights_Booking_Service/interview_prep/02_THE_FINAL_ONE_STOP_HANDBOOK.md)

**What you will master in Module 2:**
1. **Route-by-Route Reference**: Every HTTP method, API endpoint (`/user/signup`, `/bookings`, `/flights/:id/seats`), required headers (`x-access-token`, `Idempotency-Key`), and payloads across all 4 microservices.
2. **Exact Database Table Schemas**: Complete MySQL `CREATE TABLE` statements and foreign key relationships for `Users`, `Roles`, `User_Roles`, `Airports`, `Cities`, `Airplanes`, `Flights`, `Bookings`, `IdempotencyKeys`, and `Tickets`.
3. **In-Depth Concepts Explained**:
   * Exact `InnoDB` primary key index record lock mechanics when `FOR UPDATE` is executed.
   * How JWT cryptographic signature verification (`jwt.verify`) allows downstream services to remain stateless and database-free for identity checks.
   * Why AMQP manual acknowledgments (`channel.ack(msg)` vs `channel.nack(msg)`) prevent dropped E-Tickets during SMTP outages.
4. **Hour-by-Hour 1-Day Study Schedule**: A structured, stress-free study itinerary for the day before your technical interview.
5. **Rapid Revision Flashcards**: High-speed, bite-sized Q&A cards designed for quick review on the morning of your interview.

---

### 🔬 Module 3: Engineering Deep Dive (`~1.5 Hours`)
**Path:** [`interview_prep/03_DEEP_DIVE_MICROSERVICES_AUTH_PAYMENTS_SEATS_IDEMPOTENCY.md`](file:///D:/TO%20DO%20THINGS/Developer/Flights_Booking_Service/interview_prep/03_DEEP_DIVE_MICROSERVICES_AUTH_PAYMENTS_SEATS_IDEMPOTENCY.md)

**What you will master in Module 3:**
1. **Edge Gateway Security (`Port 5000`)**: Line-by-line code breakdown of `express-rate-limit` configuration, `bcrypt` 8-round salt hashing, RBAC many-to-many role joins, and `http-proxy-middleware` downstream header injection (`x-user-id`).
2. **ACID Seat Holding (`Port 4000` & `Port 3000`)**: Granular timeline trace showing exactly how MySQL places exclusive locks when `lock: true` (`SELECT ... FOR UPDATE`) is called inside `sequelize.transaction()`, halting competing threads until `t.commit()` is fired.
3. **Payment Simulation & Idempotency Key Replay**: Code walkthrough showing how `BookingService.createBooking()` intercepts duplicate checkout requests inside the `IdempotencyKeys` table and instantly replays cached `201 Created` responses in `0 milliseconds` without double-charging the user.
4. **Asynchronous AMQP Messaging (`RabbitMQ` & `Port 3002`)**: Complete explanation of durable queue assertion (`durable: true`), audit logging inside the `Tickets` database, Nodemailer SMTP execution, and `channel.nack()` automatic re-queuing when email providers experience downtime.

---

## ⚡ Quick Start: How to Begin Right Now

1. Click here to open your first comprehensive study module:
   👉 **[`interview_prep/01_MASTER_INTERVIEW_PREP_GUIDE.md`](file:///D:/TO%20DO%20THINGS/Developer/Flights_Booking_Service/interview_prep/01_MASTER_INTERVIEW_PREP_GUIDE.md)**
2. Grab a cup of coffee, set aside 2 hours, and read through **Module 1** while imagining yourself explaining the Airport Terminal analogy to a friend or interviewer.
3. Move on to **Module 2** to review the exact SQL schemas and test yourself using the **Rapid Revision Flashcards**.
4. Finish with **Module 3** to solidify your technical mastery over the exact code mechanics of ACID transactions, idempotency keys, and RabbitMQ message queues!
