# SkyElite — Premium Flight Booking Service Frontend

Built with **Next.js 16 App Router**, **React 19**, **TypeScript**, and **Tailwind CSS**, designed as the user portal for our dual-microservice flight reservation architecture.

## 🌟 Features & Visual Design
- **Cinematic Video Hero**: Full-viewport (`h-screen`) background video streaming from CloudFront with dynamic typography overlap (`"Premium."` / `"Accessible."`).
- **Glassmorphic Navigation & Modals**: Interactive navigation bar with Lucide icons and smooth backdrop blur effects.
- **Synchronous Microservices Gateway**:
  - Live Flight Catalog search proxied to **Flights Service (`Port 3000`)**.
  - ACID-compliant reservation workflow proxied to **Booking Service (`Port 4000`)**.
- **Auto-Generated Idempotency Keys**: Generates unique `x-idempotency-key` headers per booking session to guarantee safe payment retries and eliminate double-booking race conditions.

---

## 🚀 Quick Start Instructions

1. Navigate to the frontend directory:
   ```bash
   cd "C:\Users\AKSHANSH RANJAN\Desktop\Code\Flights_Booking_Service\frontend"
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) *(or port `3001` if your Flights Service backend is running on `3000`)* in your browser to experience the SkyElite interface!
