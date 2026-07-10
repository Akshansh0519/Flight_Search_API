"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, Cpu, Check, Plane, Users, RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
import { fetchAllFlights, formatTime, flightDurationMins, type Flight } from "@/lib/api";

interface DiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
  defaultTab?: "EXPLORE" | "FAQ";
}

export default function DiscoverModal({ isOpen, onClose, onOpenBooking, defaultTab = "EXPLORE" }: DiscoverModalProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"EXPLORE" | "FAQ">(defaultTab);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(defaultTab);
    loadFlights();
  }, [isOpen, defaultTab]);

  const loadFlights = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllFlights();
      setFlights(data.slice(0, 6)); // Show first 6 flights as preview
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not load flights. Make sure the Flight Service (Port 3000) is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#202A36] text-white p-6 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">SkyElite Architecture & FAQ Hub</h3>
              <p className="text-xs text-gray-300">Global Airline Reservations · 4-Microservice Ecosystem</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-white/10 p-1">
            <button
              onClick={() => setActiveTab("EXPLORE")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "EXPLORE" ? "bg-white text-[#202A36] shadow-sm" : "text-gray-300 hover:text-white"
              }`}
            >
              ◈ Explore & Architecture
            </button>
            <button
              onClick={() => setActiveTab("FAQ")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "FAQ" ? "bg-white text-[#202A36] shadow-sm" : "text-gray-300 hover:text-white"
              }`}
            >
              ❓ Frequently Asked Questions (FAQ)
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-gray-700">
          {activeTab === "EXPLORE" ? (
            <>
              {/* Why SkyElite */}
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Reliable, Real-Time Flight Booking</h4>
                <p className="text-sm leading-relaxed text-gray-600">
                  SkyElite provides seamless commercial airline flight booking by combining a real-time Flight Catalog microservice with a robust Booking Engine. Every seat reservation is executed with full database transaction safety, zero double-booking risk.
                </p>
              </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#202A36]/10 text-[#202A36] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-gray-900 text-sm">Dual-Microservice Engine</h5>
              <p className="text-xs text-gray-600">Axios-bridged Flight Catalog API (Port 3000) and Booking Engine (Port 4000) with eager-loaded association data.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-gray-900 text-sm">ACID Row-Locking</h5>
              <p className="text-xs text-gray-600">MySQL SELECT…FOR UPDATE prevents overbooking during concurrent bookings at peak load.</p>
            </div>
          </div>

          {/* Key Benefits */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Platform Benefits</h4>
            <div className="space-y-2 text-sm">
              {[
                "Idempotency keys prevent duplicate charges on retry",
                "Real-time seat inventory decrement in atomic transactions",
                "Airport & route-based flight search with date filtering",
                "Instant booking confirmation with receipt generation",
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Flights Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Available Flights (Live)</h4>
              <button onClick={loadFlights} className="text-xs text-[#202A36] hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8 gap-3 text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading from Flight Service...</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && flights.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No flights found in the database yet.</p>
            )}

            {!loading && flights.length > 0 && (
              <div className="space-y-2">
                {flights.map(flight => {
                  const durationMins = flightDurationMins(flight.departureTime, flight.arrivalTime);
                  const hours = Math.floor(durationMins / 60);
                  const mins = durationMins % 60;
                  return (
                    <div key={flight.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#202A36]/10 text-[#202A36] flex items-center justify-center">
                          <Plane className="w-4 h-4 transform -rotate-45" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {flight.departureAirportId} → {flight.arrivalAirportId}
                          </p>
                          <p className="text-xs text-gray-500">{flight.flightNumber} · {hours}h {mins}m</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#202A36]">₹{flight.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" />{flight.totalSeats} left</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-[#202A36]/5 border border-[#202A36]/15 mb-4">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#202A36]" />
                  Latest System Updates — 4 Microservice & JWT Engineering
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Answers to critical architectural questions regarding our newly updated dual-database, JWT API Gateway, and RabbitMQ event pipeline.
                </p>
              </div>

              {[
                {
                  q: "1. How does the central API Gateway Service (Port 5000) handle JWT Security?",
                  a: "All client requests route through our Reverse Proxy Gateway on Port 5000. When you Sign In or Create an Account, our custom JWT Authentication Middleware verifies and issues signed tokens (`Authorization: Bearer <token>`), decoupling authentication from downstream flight/booking domains."
                },
                {
                  q: "2. Why are Flights (Port 3000) and Bookings (Port 4000) separate microservices?",
                  a: "Separation of concerns allows independent scaling! The Flight Search API (`Flights_Booking_Service`) optimizes for read-heavy query performance and route discovery, while the Booking Service (`Booking_Service`) specializes in write-heavy ACID transaction processing and payment idempotency."
                },
                {
                  q: "3. How does ACID Row-Locking (`SELECT ... FOR UPDATE`) prevent double bookings?",
                  a: "When multiple passengers book the last seat simultaneously, `Booking_Service` executes a synchronous Axios check inside a strict MySQL database transaction (`sequelize.transaction()`). The row lock guarantees atomic seat decrements (`totalSeats = totalSeats - noOfSeats`) without race conditions."
                },
                {
                  q: "4. How does the asynchronous RabbitMQ Notification Service (Port 3002) work?",
                  a: "To keep booking confirmation responses sub-50ms, email generation is fully asynchronous. Once a booking is committed, an event is published to `NOTIFICATION_QUEUE` (`amqps://`). The `Notification-Service-Flights` worker consumes the payload, audits it in MySQL, and dispatches your HTML E-Ticket via Nodemailer."
                },
                {
                  q: "5. What happens if network timeouts occur during checkout (Idempotency Key)?",
                  a: "Every booking request includes an `Idempotency-Key` header stored inside our `IdempotencyRepository`. If a client retries after a network hiccup or double-clicks 'Confirm & Pay', the server immediately returns the cached transaction result (`200 OK`) instead of creating a duplicate reservation or double charge."
                }
              ].map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-150 flex flex-col gap-2 hover:border-gray-300 transition-colors">
                  <h5 className="font-bold text-gray-900 text-sm">{faq.q}</h5>
                  <p className="text-xs leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white text-sm">
            Close
          </button>
          <button
            onClick={() => { onClose(); onOpenBooking(); }}
            className="px-6 py-2.5 rounded-xl bg-[#202A36] hover:bg-[#1a2229] text-white font-medium shadow-md text-sm flex items-center gap-2"
          >
            <Plane className="w-4 h-4 -rotate-45" />
            Search & Book Flights
          </button>
        </div>
      </div>
    </div>
  );
}
