"use client";

import React, { useState } from "react";
import { Server, ShieldCheck, Mail, ArrowRight, Cpu, Database, Activity, Code } from "lucide-react";

interface ArchitectureHubProps {
  onOpenBooking: () => void;
  onOpenDiscover: () => void;
}

// Helper Status Badge component inspired by DESIGN_SYSTEM_AND_UI_GUIDE.md
function StatusBadge({ status = "SYSTEM ONLINE", color = "emerald" }: { status?: string; color?: "emerald" | "cyan" | "crimson" }) {
  const colorMap = {
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    crimson: "text-red-400 border-red-500/30 bg-red-500/10",
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-widest uppercase shadow-sm ${colorMap[color]}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
      </span>
      {status}
    </div>
  );
}

export default function ArchitectureHub({ onOpenBooking, onOpenDiscover }: ArchitectureHubProps) {
  const [showPayload, setShowPayload] = useState(false);

  return (
    <section id="architecture" className="relative w-full bg-[#0a0a0a] text-white py-24 px-6 sm:px-8 overflow-hidden">
      {/* Top Architecture Header & Live Status Bar */}
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center mb-16">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <StatusBadge status="FLIGHTS API (:3000) • ONLINE" color="emerald" />
          <StatusBadge status="BOOKING API (:4000) • ONLINE" color="emerald" />
          <StatusBadge status="RABBITMQ QUEUE (:3002) • ACTIVE" color="cyan" />
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 drop-shadow-md">
          Distributed Microservice Architecture
        </h2>
        <p className="text-zinc-400 text-lg sm:text-xl max-w-3xl font-normal leading-relaxed">
          SkyElite is engineered with a decoupled 3-tier Node.js/Express backend communicating synchronously via HTTP and asynchronously via RabbitMQ event streams.
        </p>

        {/* Technical Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-10 pt-8 border-t border-white/10 font-mono text-sm">
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#121212] border border-white/10">
            <span className="text-zinc-500 text-xs">GATEWAY LATENCY</span>
            <span className="text-cyan-400 font-bold text-lg">&lt; 18ms</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#121212] border border-white/10">
            <span className="text-zinc-500 text-xs">TRANSACTIONS</span>
            <span className="text-emerald-400 font-bold text-lg">ACID Two-Phase</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#121212] border border-white/10">
            <span className="text-zinc-500 text-xs">IDEMPOTENCY</span>
            <span className="text-purple-400 font-bold text-lg">Strict Header Check</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#121212] border border-white/10">
            <span className="text-zinc-500 text-xs">MESSAGE BROKER</span>
            <span className="text-[#ff2a2a] font-bold text-lg">RabbitMQ AMQP</span>
          </div>
        </div>
      </div>

      {/* Cyberpunk Glassmorphism Microservice Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-28">
        
        {/* Card 1: Flights Search API */}
        <div className="group relative bg-[#121212]/90 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(0,240,255,0.15)] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400 animate-pulse" />
              MICROSERVICE 01 • PORT 3000
            </div>
            <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors duration-200 mb-4">
              Flights Catalog Engine
            </h3>
            <p className="text-zinc-400 text-base leading-relaxed mb-6">
              Responsible for high-concurrency route queries, multi-city filtering, pricing models, and atomic seat inventory management.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 pb-6 mb-6 border-b border-white/10 font-mono text-xs">
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">Express / Node.js</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">Sequelize ORM</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">GET /api/v1/flights</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">PATCH /seats</span>
            </div>

            <button
              onClick={onOpenDiscover}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-white/10 text-white font-bold text-sm tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Explore Flight Routes</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Card 2: Booking & Payment API */}
        <div className="group relative bg-[#121212]/90 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
              MICROSERVICE 02 • PORT 4000
            </div>
            <h3 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors duration-200 mb-4">
              Booking & Payment Core
            </h3>
            <p className="text-zinc-400 text-base leading-relaxed mb-6">
              Coordinates two-phase reservations (<code className="text-emerald-400 font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">initiated</code> $\to$ <code className="text-emerald-400 font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">booked</code>). Enforces <code className="text-emerald-400 font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">x-idempotency-key</code> headers to guarantee zero double-charges.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 pb-6 mb-6 border-b border-white/10 font-mono text-xs">
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">IdempotencyKey Model</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">MySQL Transactions</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">POST /bookings</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">POST /payments</span>
            </div>

            <button
              onClick={onOpenBooking}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-white/10 text-white font-bold text-sm tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Test ACID Checkout Flow</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Card 3: RabbitMQ Notification Service */}
        <div className="group relative bg-[#121212]/90 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-bold tracking-[0.2em] text-purple-400 uppercase mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400 animate-pulse" />
              MICROSERVICE 03 • PORT 3002
            </div>
            <h3 className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors duration-200 mb-4">
              Event-Driven Email Consumer
            </h3>
            <p className="text-zinc-400 text-base leading-relaxed mb-4">
              Decoupled background consumer consuming from <code className="text-purple-400 font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">Notification-Queue</code> to dispatch instant confirmation emails via Nodemailer upon payment commit.
            </p>

            {/* Interactive Payload Preview Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowPayload(!showPayload)}
                className="text-xs font-mono font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors underline underline-offset-4"
              >
                <Code className="w-3.5 h-3.5" />
                {showPayload ? "Hide RabbitMQ JSON Payload" : "Inspect RabbitMQ JSON Payload"}
              </button>

              {showPayload && (
                <div className="mt-3 p-3 rounded-lg bg-black/80 border border-purple-500/30 text-xs font-mono text-purple-300 animate-in fade-in duration-200">
                  <pre className="overflow-x-auto whitespace-pre-wrap">
{`{
  "recepientEmail": "user@gmail.com",
  "subject": "Flight booked",
  "text": "Booking successfully done for the booking 11",
  "status": "booked"
}`}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 pb-6 mb-6 border-b border-white/10 font-mono text-xs">
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">RabbitMQ / AMQP</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">Nodemailer</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">channel.consume()</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-300 rounded-lg border border-white/5">channel.ack()</span>
            </div>

            <button
              onClick={() => setShowPayload(!showPayload)}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-purple-500/20 hover:border-purple-500/50 border border-white/10 text-white font-bold text-sm tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>{showPayload ? "Close Envelope View" : "View Message Payload"}</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>

      </div>

      {/* Signature Depth Clipping Architectural Section (Layered Typography from DESIGN_SYSTEM_AND_UI_GUIDE.md) */}
      <div className="relative w-full overflow-hidden flex flex-col justify-between items-center pt-16 pb-12 border-t border-white/10">
        
        {/* 1. Background Watermark Typography (Layer 0) */}
        <div className="absolute top-8 left-0 w-full h-full flex justify-center items-start pointer-events-none z-0">
          <h1 
            className="text-[17vw] leading-[0.8] font-black text-white/10 uppercase tracking-tighter select-none scale-y-[1.4] origin-top"
            style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
          >
            MICROSERVICES
          </h1>
        </div>

        {/* 2. Spacer to allow top of text watermark to be clearly visible */}
        <div className="w-full h-36 md:h-48 z-0"></div>

        {/* 3. Foreground Content Card (Layer 10 - Overlaps Background Text!) */}
        <div className="relative z-10 w-[95%] sm:w-[85%] max-w-5xl bg-[#ff2a2a] text-white p-8 sm:p-14 rounded-3xl shadow-[0_25px_60px_-12px_rgba(255,42,42,0.4)] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 backdrop-blur-xl border border-white/20">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="text-xs font-mono font-bold tracking-[0.25em] uppercase opacity-90 flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin" />
              SYSTEM DESIGN HIGHLIGHT
            </div>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Why Engineers & Recruiters Love SkyElite
            </h3>
            <p className="text-white/95 text-base sm:text-lg leading-relaxed font-normal">
              Unlike basic monolithic CRUD applications, SkyElite decouples seat reservation (<code className="bg-black/30 px-2 py-0.5 rounded font-mono text-sm">Port 3000</code>), payment verification (<code className="bg-black/30 px-2 py-0.5 rounded font-mono text-sm">Port 4000</code>), and asynchronous email dispatch (<code className="bg-black/30 px-2 py-0.5 rounded font-mono text-sm">Port 3002</code>) over RabbitMQ queues—guaranteeing strict ACID transactions and eliminating double-billing race conditions.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenBooking}
              className="px-8 py-4 bg-black text-white font-bold rounded-xl tracking-wider uppercase text-sm hover:bg-zinc-900 transition-all duration-200 shadow-2xl flex items-center justify-center gap-2 border border-white/20 hover:scale-105 active:scale-95"
            >
              <span>Launch Booking Flow</span>
              <ArrowRight className="w-4 h-4 text-[#ff2a2a]" />
            </button>
            <button
              onClick={onOpenDiscover}
              className="px-8 py-3.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl tracking-wider uppercase text-xs transition-all duration-200 text-center"
            >
              Explore All 200+ Flights
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
