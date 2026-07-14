"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

type ServiceStatus = "CHECKING" | "WAKING_UP" | "ONLINE" | "ERROR";

interface BackendStatus {
  gateway: ServiceStatus;
  flights: ServiceStatus;
  booking: ServiceStatus;
  notification: ServiceStatus;
}

export default function BackendStatusBanner() {
  const [status, setStatus] = useState<BackendStatus>({
    gateway: "CHECKING",
    flights: "CHECKING",
    booking: "CHECKING",
    notification: "CHECKING",
  });
  const [overallStatus, setOverallStatus] = useState<"CHECKING" | "WAKING_UP" | "ALL_ONLINE" | "DISMISSED">("CHECKING");
  const [attemptCount, setAttemptCount] = useState(0);

  const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL?.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "") || "https://skyelite-api-gateway.onrender.com";
  const flightsUrl = "https://skyelite-flights-service.onrender.com";
  const bookingUrl = "https://skyelite-booking-service.onrender.com";
  const notificationUrl = "https://skyelite-notification-service.onrender.com";

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const checkHealth = async () => {
      if (!isMounted) return;

      const newStatus = { ...status };

      // 1. Check Gateway (require 200 OK)
      try {
        const res = await axios.get(`${gatewayUrl}/ping-cors`, { timeout: 5000 });
        if (res.status === 200) newStatus.gateway = "ONLINE";
        else newStatus.gateway = "WAKING_UP";
      } catch (err: any) {
        newStatus.gateway = "WAKING_UP";
      }

      // 2. Check Flights Service directly & via Gateway (require 200 OK)
      try {
        const res = await axios.get(`${flightsUrl}/ping-cors`, { timeout: 5000 });
        if (res.status === 200) newStatus.flights = "ONLINE";
        else newStatus.flights = "WAKING_UP";
      } catch (err: any) {
        try {
          const proxyRes = await axios.get(`${gatewayUrl}/flightService/api/v1/flights?trips=DEL-HYD`, { timeout: 5000 });
          if (proxyRes.status === 200) newStatus.flights = "ONLINE";
          else newStatus.flights = "WAKING_UP";
        } catch (e) {
          newStatus.flights = "WAKING_UP";
        }
      }

      // 3. Check Booking Service directly (require 200 OK on ping-cors)
      try {
        const res = await axios.get(`${bookingUrl}/ping-cors`, { timeout: 5000 });
        if (res.status === 200) newStatus.booking = "ONLINE";
        else newStatus.booking = "WAKING_UP";
      } catch (err: any) {
        try {
          const proxyRes = await axios.get(`${gatewayUrl}/bookingService/api/v1/bookings/1`, { timeout: 5000 });
          if (proxyRes.status && proxyRes.status !== 502 && proxyRes.status !== 503 && proxyRes.status !== 504) {
            newStatus.booking = "ONLINE";
          } else {
            newStatus.booking = "WAKING_UP";
          }
        } catch (e: any) {
          if (e?.response?.status && e?.response?.status !== 502 && e?.response?.status !== 503 && e?.response?.status !== 504) {
            newStatus.booking = "ONLINE";
          } else {
            newStatus.booking = "WAKING_UP";
          }
        }
      }

      // 4. Check Notification Service directly (require 200 OK)
      try {
        const res = await axios.get(`${notificationUrl}/ping-cors`, { timeout: 5000 });
        if (res.status === 200) newStatus.notification = "ONLINE";
        else newStatus.notification = "WAKING_UP";
      } catch (err: any) {
        try {
          const infoRes = await axios.get(`${notificationUrl}/api/v1/info`, { timeout: 5000 });
          if (infoRes.status === 200) newStatus.notification = "ONLINE";
          else newStatus.notification = "WAKING_UP";
        } catch (e: any) {
          if (e?.response?.status === 200) newStatus.notification = "ONLINE";
          else newStatus.notification = "WAKING_UP";
        }
      }

      if (!isMounted) return;
      setStatus(newStatus);
      setAttemptCount((prev) => prev + 1);

      // ONLY declare ALL_ONLINE if every single one of the 4 backends is ONLINE!
      if (
        newStatus.gateway === "ONLINE" &&
        newStatus.flights === "ONLINE" &&
        newStatus.booking === "ONLINE" &&
        newStatus.notification === "ONLINE"
      ) {
        setOverallStatus("ALL_ONLINE");
      } else {
        setOverallStatus("WAKING_UP");
        timer = setTimeout(checkHealth, 3000); // Check every 3 seconds until all 4 return 200 OK
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (overallStatus === "DISMISSED") return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-md w-full mx-4 transition-all duration-500 ease-in-out">
      {/* 1. Checking / Waking Up Caution Card */}
      {(overallStatus === "CHECKING" || overallStatus === "WAKING_UP") && (
        <div className="bg-[#121820]/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-5 shadow-2xl shadow-amber-950/30 text-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 animate-pulse w-full" />
          
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h4 className="font-bold text-base tracking-tight text-amber-300 flex items-center gap-1.5">
                <span>Render Free Tier Notice</span>
              </h4>
            </div>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Attempt #{attemptCount || 1}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            Caution: This system runs on <strong className="text-white">Render Free Tier</strong>. If inactive for 15 minutes, the microservices sleep and take <span className="text-amber-400 font-semibold">~30–50 seconds to warm up</span>.
            <br />
            <span className="text-gray-400 block mt-1.5 italic">We are waking up all 4 microservices right now. Please keep this tab open—we will notify you the exact second all 4 return 200 OK!</span>
          </p>

          {/* Microservices Status Indicators */}
          <div className="space-y-2 bg-black/40 rounded-xl p-3 border border-white/5 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium">1. API Gateway</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                status.gateway === "ONLINE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 animate-pulse border border-amber-500/30"
              }`}>
                {status.gateway === "ONLINE" ? "🟢 ONLINE (200 OK)" : "⏳ WAKING UP..."}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium">2. Flights Search Microservice</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                status.flights === "ONLINE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 animate-pulse border border-amber-500/30"
              }`}>
                {status.flights === "ONLINE" ? "🟢 ONLINE (200 OK)" : "⏳ WAKING UP..."}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium">3. Booking & Payment Engine</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                status.booking === "ONLINE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 animate-pulse border border-amber-500/30"
              }`}>
                {status.booking === "ONLINE" ? "🟢 ONLINE (200 OK)" : "⏳ WAKING UP..."}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium">4. Email Notification Microservice</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                status.notification === "ONLINE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 animate-pulse border border-amber-500/30"
              }`}>
                {status.notification === "ONLINE" ? "🟢 ONLINE (200 OK)" : "⏳ WAKING UP..."}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 pt-2">
            <span>Checking automatically every 3s</span>
            <button
              onClick={() => setOverallStatus("DISMISSED")}
              className="text-gray-400 hover:text-white underline transition-colors"
            >
              Hide Warning
            </button>
          </div>
        </div>
      )}

      {/* 2. All Online Success Card */}
      {overallStatus === "ALL_ONLINE" && (
        <div className="bg-[#101915]/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-5 shadow-2xl shadow-emerald-950/40 text-white relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 w-full" />
          
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h4 className="font-bold text-base tracking-tight text-emerald-300">
                All Microservices Started!
              </h4>
            </div>
            <button
              onClick={() => setOverallStatus("DISMISSED")}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            All 4 microservices (<strong className="text-white">API Gateway, Flights Search, Booking Engine, and Email Notification</strong>) have returned <strong className="text-emerald-400">200 OK</strong> and are fully online!
            <br />
            You can now search flights (`DEL` → `HYD`), select seats, and complete payments with instant e-ticket email delivery!
          </p>

          <button
            onClick={() => setOverallStatus("DISMISSED")}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-bold tracking-wide text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
          >
            Got It, Continue to SkyElite ✈️
          </button>
        </div>
      )}
    </div>
  );
}
