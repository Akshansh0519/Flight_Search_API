# 🌐 100% Free, Zero-Credit-Card Deployment Guide (`SkyElite Flights`)
**How to Deploy all 4 Microservices, 4 MySQL Databases, RabbitMQ, and the Next.js Cyberpunk Frontend to the Cloud Without Spending $1 or Entering a Credit Card**

---

## 🛑 The "No-Credit-Card / Free-Forever" Stack Map

Because platforms like **Railway**, **Heroku**, and **AWS/GCP** now require credit cards or paid subscriptions, we will use the absolute best modern **Zero-Credit-Card Gold Standard Stack** in 2026:

```
====================================================================================================
                        FRONTEND LAYER: Next.js 16 Cyberpunk SPA
         Hosted on: VERCEL (`vercel.com`) — 100% Free Hobby Tier · No Card Needed
         URL: `https://skyelite-flights.vercel.app`
====================================================================================================
                                         │
                                         │ HTTPS REST / JSON (`NEXT_PUBLIC_API_GATEWAY_URL`)
                                         ▼
====================================================================================================
                   MICROSERVICE 1: API Gateway Service (`Port 5000`)
         Hosted on: RENDER (`render.com`) — Free Node.js Web Service · No Card Needed
         URL: `https://skyelite-api-gateway.onrender.com`
====================================================================================================
                   │                                               │
                   ▼                                               ▼
┌──────────────────────────────────────┐       ┌──────────────────────────────────────────────────┐
│  MICROSERVICE 2: Flight Search API   │       │  MICROSERVICE 3: Booking Service                 │
│  Hosted on: RENDER (`render.com`)    │       │  Hosted on: RENDER (`render.com`)                │
│  URL: `skyelite-flights.onrender.com`│       │  URL: `skyelite-booking.onrender.com`            │
└──────────────────────────────────────┘       └──────────────────────────────────────────────────┘
                   │                                               │
                   │                                               │ Emits AMQP Message (`RABBITMQ_URL`)
                   ▼                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE LAYER: 4 Independent MySQL DBs                              │
│         Hosted on: TiDB Cloud (`tidbcloud.com`) or Aiven (`aiven.io`) — 5GB Free Serverless      │
│         • DB 1: `skyelite_auth_db`      • DB 2: `skyelite_flights_db`                            │
│         • DB 3: `skyelite_booking_db`   • DB 4: `skyelite_notification_db`                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                   │
                                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     MESSAGE BROKER LAYER: RabbitMQ (`Notification-Queue`)                        │
│         Hosted on: CloudAMQP (`cloudamqp.com`) — "Little Lemur" Plan (1M msgs/month Free)        │
│         URL: `amqps://username:password@lemur.cloudamqp.com/username`                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                   │
                                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     MICROSERVICE 4: Notification Service Worker                                  │
│         Hosted on: RENDER (`render.com`) — Free Background Worker / Web Service                  │
│         Consumes messages directly from CloudAMQP (`RABBITMQ_URL`) and sends Nodemailer E-Tickets│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Phase 1: Free Cloud RabbitMQ (`CloudAMQP` - 3 Minutes)

1. Go to **[CloudAMQP.com](https://www.cloudamqp.com/)** and click **"Get Started Free"**.
2. Sign up using your **GitHub account** (No credit card required).
3. Click **"Create New Instance"**:
   - **Name:** `SkyElite-RabbitMQ`
   - **Plan:** Select **Little Lemur (Free - 0$/month)** (Gives 1,000,000 free messages per month!).
   - **Region:** Select `Amazon Web Services (AWS) - US-East-1` (or closest region).
4. Click **Create Instance**. Once created, click on its name to open the details page.
5. Copy the **AMQP URL** (It looks exactly like: `amqps://xyzkqwrt:SecretPassword@lemur.cloudamqp.com/xyzkqwrt`).
   * *⚠️ CODE COMPATIBILITY VERIFIED: Your code (`queue-config.js` and `server-config.js`) reads this via `process.env.RABBITMQ_URL`. We will paste this exact `amqps://...` link into Render under `RABBITMQ_URL` in Phase 4!*

---

## 📋 Phase 2: Free Cloud MySQL Databases (`TiDB Cloud` / `Aiven` - 5 Minutes)

We need free cloud MySQL databases for our 4 microservices. You have two amazing **No-Credit-Card** choices:
* **Option A: TiDB Cloud ([tidbcloud.com](https://tidbcloud.com/))** (Serverless MySQL-Compatible DB - 5GB Free forever).
* **Option B: Aiven ([aiven.io](https://aiven.io/))** (100% Free MySQL Service tier).

### Step-by-Step setup using TiDB Cloud (Recommended):
1. Go to **[tidbcloud.com](https://tidbcloud.com/)** and sign up with **Google or GitHub** (Zero credit card needed).
2. Click **"Create Cluster"** ➔ Select **Serverless Tier (Free)** ➔ Click **Create**.
3. Once ready, click on your cluster name and select **"Connect"** inside the console.
4. Choose **General / Node.js** connection string. Copy your exact database connection credentials:
   - **Host (`DB_HOST`):** `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - **Port (`DB_PORT`):** `4000` *(⚠️ Standard MySQL is 3306, but TiDB Cloud specifically uses `4000`! We have verified and updated all 4 `sequelize-config.js` files in your codebase to read `process.env.DB_PORT` and `process.env.DB_SSL` so this works out-of-the-box without connection refusal errors!)*
   - **Username (`DB_USER`):** `28J3klp9abc.root`
   - **Password (`DB_PASSWORD`):** `<your-chosen-password>`
5. Inside your database dashboard (or using MySQL Workbench / DBeaver / VS Code extension connected to this host), execute these 4 SQL commands to create your 4 isolated microservice databases:
   ```sql
   CREATE DATABASE IF NOT EXISTS skyelite_auth_db;
   CREATE DATABASE IF NOT EXISTS skyelite_flights_db;
   CREATE DATABASE IF NOT EXISTS skyelite_booking_db;
   CREATE DATABASE IF NOT EXISTS skyelite_notification_db;
   ```

---

## 📋 Phase 3: Push Your 4 Verified Microservices to GitHub

We have just verified (`/verification-before-completion`) and upgraded all 4 database configuration files (`sequelize-config.js` inside `Flights_Booking_Service`, `Booking_Service`, `Api_gateway_flights`, and `Notification-Service-Flights`) to ensure they natively support `process.env.DB_PORT` and `process.env.DB_SSL === 'true'` (required for TiDB Cloud & Aiven SSL connections).

1. Commit all modified config files across your directories:
   ```powershell
   git add .
   git commit -m "Add cloud DB_PORT and SSL compatibility for TiDB and Aiven"
   git push origin main
   ```

---

## 📋 Phase 4: Deploying all 4 Microservices to `Render.com` (15 Minutes)

Go to **[render.com](https://render.com/)** and sign in with your **GitHub Account** (No credit card required).

We will create **4 Free Web Services** on Render. Since each microservice lives in its own repository or folder structure (`Flights_Booking_Service`, `Booking_Service`, `Api_gateway_flights`, and `Notification-Service-Flights`), follow these exact environment configurations:

---

### Step 4.1: Deploy Flight Search Service (`Flights_Booking_Service` — `Port 3000` equivalent)
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Connect your `Flights_Booking_Service` GitHub repository.
3. Configure the service settings:
   - **Name:** `skyelite-flights-service`
   - **Region:** US East (or closest to your CloudAMQP/TiDB)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npx sequelize-cli db:migrate && npm start` *(Runs database migrations automatically on boot!)*
   - **Instance Type:** Select **Free ($0/month)**.
4. Scroll down to **Environment Variables** and exact-match your code requirements:
   - `NODE_ENV` = `production`
   - `DB_HOST` = `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - `DB_PORT` = `4000`
   - `DB_USER` = `<your-tidb-user.root>`
   - `DB_PASSWORD` = `<your-tidb-password>` *(⚠️ Note: Use `DB_PASSWORD`, exactly what `sequelize-config.js` checks!)*
   - `DB_NAME_PROD` = `skyelite_flights_db`
   - `DB_SSL` = `true` *(Enables required TiDB SSL)*
5. Click **Create Web Service**.
   * Copy the generated HTTPS URL: `https://skyelite-flights-service.onrender.com`.

---

### Step 4.2: Deploy Booking Service (`Booking_Service` — `Port 4000` equivalent)
1. Click **New +** ➔ **Web Service** ➔ Connect your `Booking_Service` repository.
2. Configure:
   - **Name:** `skyelite-booking-service`
   - **Build Command:** `npm install`
   - **Start Command:** `npx sequelize-cli db:migrate && npm start`
   - **Instance Type:** **Free ($0/month)**.
3. **Environment Variables (Exact Code Match Verified):**
   - `NODE_ENV` = `production`
   - `DB_HOST` = `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - `DB_PORT` = `4000`
   - `DB_USER` = `<your-tidb-user.root>`
   - `DB_PASSWORD` = `<your-tidb-password>`
   - `DB_NAME_PROD` = `skyelite_booking_db`
   - `DB_SSL` = `true`
   - `FLIGHT_SERVICE_PATH` = `https://skyelite-flights-service.onrender.com` *(So Axios calls `axios.get(FLIGHT_SERVICE_PATH + '/api/v1/flights/...')` route straight to your live search service!)*
   - `RABBITMQ_URL` = `amqps://xyzkqwrt:SecretPassword@lemur.cloudamqp.com/xyzkqwrt` *(⚠️ Exact variable name verified from `server-config.js` line 7)*
   - `RABBITMQ_QUEUE_NAME` = `Notification-Queue`
4. Click **Create Web Service**.
   * Copy the generated HTTPS URL: `https://skyelite-booking-service.onrender.com`.

---

### Step 4.3: Deploy Notification Service (`Notification-Service-Flights` — `Port 3002` equivalent)
1. Click **New +** ➔ **Web Service** ➔ Connect `Notification-Service-Flights` repository.
2. Configure:
   - **Name:** `skyelite-notification-service`
   - **Build Command:** `npm install`
   - **Start Command:** `npx sequelize-cli db:migrate && npm start`
   - **Instance Type:** **Free ($0/month)**.
3. **Environment Variables (Exact Code Match Verified):**
   - `NODE_ENV` = `production`
   - `DB_HOST` = `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - `DB_PORT` = `4000`
   - `DB_USER` = `<your-tidb-user.root>`
   - `DB_PASSWORD` = `<your-tidb-password>`
   - `DB_NAME_PROD` = `skyelite_notification_db`
   - `DB_SSL` = `true`
   - `RABBITMQ_URL` = `amqps://xyzkqwrt:SecretPassword@lemur.cloudamqp.com/xyzkqwrt` *(From Phase 1)*
   - `RABBITMQ_QUEUE_NAME` = `Notification-Queue`
   - `GMAIL_EMAIL` = `your-demo-gmail@gmail.com`
   - `GMAIL_PASSWORD` = `your-16-character-google-app-password`
4. Click **Create Web Service**.

---

### Step 4.4: Deploy API Gateway (`Api_gateway_flights` — `Port 5000` equivalent — Master Entrypoint!)
1. Click **New +** ➔ **Web Service** ➔ Connect `Api_gateway_flights` repository.
2. Configure:
   - **Name:** `skyelite-api-gateway`
   - **Build Command:** `npm install`
   - **Start Command:** `npx sequelize-cli db:migrate && npm start`
   - **Instance Type:** **Free ($0/month)**.
3. **Environment Variables (Exact Code Match Verified):**
   - `NODE_ENV` = `production`
   - `DB_HOST` = `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - `DB_PORT` = `4000`
   - `DB_USER` = `<your-tidb-user.root>`
   - `DB_PASSWORD` = `<your-tidb-password>`
   - `DB_NAME_PROD` = `skyelite_auth_db`
   - `DB_SSL` = `true`
   - `JWT_SECRET_KEY` = `super_secret_jwt_key_skyelite_2026` *(⚠️ Note: Code in `server-config.js` line 8 specifically reads `JWT_SECRET_KEY`!)*
   - `FLIGHT_SERVICE_URL` = `https://skyelite-flights-service.onrender.com` *(From Step 4.1)*
   - `BOOKING_SERVICE_URL` = `https://skyelite-booking-service.onrender.com` *(From Step 4.2)*
4. Click **Create Web Service**.
   * **🎯 Copy your master API Gateway URL:** `https://skyelite-api-gateway.onrender.com`
   *(All frontend traffic will route securely through this exact URL!)*

---

## 📋 Phase 5: Deploying Frontend (`frontend/`) to `Vercel.com` (5 Minutes)

1. Go to **[vercel.com](https://vercel.com/)** and sign in with **GitHub** (No credit card needed).
2. Click **"Add New..."** ➔ **Project** ➔ Import your `Flights_Booking_Service` repo.
3. In the Vercel project configuration:
   - **Root Directory:** Click `Edit` and select **`frontend`**!
   - **Framework Preset:** Vercel automatically detects **Next.js**.
4. Expand **Environment Variables** and add:
   - **Name:** `NEXT_PUBLIC_API_GATEWAY_URL`
   - **Value:** `https://skyelite-api-gateway.onrender.com/api/v1` *(Your live Render Gateway URL from Step 4.4)*
5. Click **Deploy**!
   * Within 60 seconds, Vercel builds your Cyberpunk Glassmorphic UI and gives you a free, lightning-fast global URL: **`https://skyelite-flights.vercel.app`**!

---

## 🚀 Pro-Tip: How to Prevent Free Render "Cold Starts" Before Interviews!

Because Render's **Free Tier ($0/month)** puts web services to sleep after **15 minutes of inactivity**, the very first request after an hour of silence takes **~30 to 45 seconds to wake up**.

### How to keep all 4 microservices awake 24/7 during interview week (`100% Free`):
1. Go to **[cron-job.org](https://cron-job.org/en/)** (A 100% free external cron ping service requiring no registration/card).
2. Create 4 free cron jobs targeting your 4 Render URLs (pinging `/api/v1/flights` or `/` every **10 minutes**):
   - `https://skyelite-api-gateway.onrender.com`
   - `https://skyelite-flights-service.onrender.com`
   - `https://skyelite-booking-service.onrender.com`
   - `https://skyelite-notification-service.onrender.com`
3. Now, whenever an interviewer opens your Vercel frontend or asks to see a live demo during the call, **your microservices will be 100% awake and respond instantly in `<50ms`!** 🎉
