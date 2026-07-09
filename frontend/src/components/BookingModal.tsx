"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X, Plane, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck,
  Search, Calendar, Users, ArrowRight, ChevronDown, Clock
} from "lucide-react";
import {
  fetchAllFlights, fetchAllAirports, createBooking, fetchBookingById, makePayment,
  generateIdempotencyKey, formatTime, formatDate, flightDurationMins, applyTravelDate,
  type Flight, type Airport, type Booking, type FlightSearchParams
} from "@/lib/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "SEARCH" | "SELECT" | "CONFIRM" | "SUCCESS" | "ERROR";

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  // ─── Search state ───
  const [airports, setAirports] = useState<Airport[]>([
    { id: 1, name: "Indira Gandhi International Airport", code: "IGA", address: "New Delhi", cityId: 2 },
    { id: 2, name: "Rajiv Gandhi International Airport", code: "HYD", address: "Hyderabad", cityId: 8 },
    { id: 4, name: "Chhatrapati Shivaji Maharaj International Airport", code: "BOM", address: "Mumbai", cityId: 9 },
    { id: 5, name: "Kempegowda International Airport", code: "BLR", address: "Bengaluru", cityId: 4 },
    { id: 6, name: "Chennai International Airport", code: "MAA", address: "Chennai", cityId: 5 },
    { id: 7, name: "Netaji Subhas Chandra Bose International Airport", code: "CCU", address: "Kolkata", cityId: 6 },
  ]);
  const [departureCode, setDepartureCode] = useState("");
  const [arrivalCode, setArrivalCode] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [travellers, setTravellers] = useState(1);

  // ─── Results state ───
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [flightError, setFlightError] = useState("");

  // ─── Booking state ───
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [userId, setUserId] = useState("1");
  const [noOfSeats, setNoOfSeats] = useState(1);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingData, setBookingData] = useState<Booking | null>(null);

  // ─── Payment state ───
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("akshanshranjan007@gmail.com");

  const [step, setStep] = useState<Step>("SEARCH");

  // ─── On modal open ───
  useEffect(() => {
    if (!isOpen) return;
    setStep("SEARCH");
    setFlights([]);
    setSelectedFlight(null);
    setFlightError("");
    setBookingStatus("IDLE");
    setBookingData(null);
    setPaymentStatus("IDLE");
    setPaymentMessage("");
    setRecipientEmail("akshanshranjan007@gmail.com");
    setIdempotencyKey(generateIdempotencyKey());
    loadAirports();
  }, [isOpen]);

const DEFAULT_AIRPORTS: Airport[] = [
  { id: 1, name: "Indira Gandhi International Airport", code: "IGA", address: "New Delhi", cityId: 2 },
  { id: 2, name: "Rajiv Gandhi International Airport", code: "HYD", address: "Hyderabad", cityId: 8 },
  { id: 4, name: "Chhatrapati Shivaji Maharaj International Airport", code: "BOM", address: "Mumbai", cityId: 9 },
  { id: 5, name: "Kempegowda International Airport", code: "BLR", address: "Bengaluru", cityId: 4 },
  { id: 6, name: "Chennai International Airport", code: "MAA", address: "Chennai", cityId: 5 },
  { id: 7, name: "Netaji Subhas Chandra Bose International Airport", code: "CCU", address: "Kolkata", cityId: 6 },
];

  const loadAirports = async () => {
    try {
      const data = await fetchAllAirports();
      if (data && data.length > 0) {
        setAirports(data);
      } else {
        setAirports(DEFAULT_AIRPORTS);
      }
    } catch {
      setAirports(DEFAULT_AIRPORTS);
    }
  };

  const searchFlights = async () => {
    if (!departureCode || !arrivalCode) {
      setFlightError("Please select both departure and arrival airports.");
      return;
    }
    if (departureCode === arrivalCode) {
      setFlightError("Departure and arrival airports cannot be the same.");
      return;
    }
    setFlightError("");
    setLoadingFlights(true);
    setFlights([]);
    setStep("SELECT");

    const params: FlightSearchParams = {
      trips: `${departureCode.toUpperCase()}-${arrivalCode.toUpperCase()}`,
      travellers: travellers > 0 ? travellers : undefined,
    };
    if (departureDate) params.departureDate = departureDate;

    try {
      const data = await fetchAllFlights(params);
      setFlights(data);
    } catch (err: any) {
      // Smart Fallback 1: If date was specified and no flights found, try searching the route without date
      if (departureDate) {
        try {
          const routeParams: FlightSearchParams = {
            trips: `${departureCode.toUpperCase()}-${arrivalCode.toUpperCase()}`,
            travellers: travellers > 0 ? travellers : undefined,
          };
          const routeData = await fetchAllFlights(routeParams);
          setFlights(routeData);
          setFlightError(`No flights found on ${departureDate} for ${departureCode} → ${arrivalCode}. Showing available flights on other dates below:`);
          setLoadingFlights(false);
          return;
        } catch {
          // Fall through to Smart Fallback 2
        }
      }

      // Smart Fallback 2: If no direct flights exist on this route, search for indirect 1-stop connections
      try {
        const allData = await fetchAllFlights({});
        const depUpper = departureCode.toUpperCase();
        const arrUpper = arrivalCode.toUpperCase();

        const leg1s = allData.filter(f => (f.departureAirportId?.toUpperCase() === depUpper || f.departureAirport?.code?.toUpperCase() === depUpper));
        const connectingFlights: Flight[] = [];
        const viaAirports = new Set<string>();

        for (const f1 of leg1s) {
          const mid = (f1.arrivalAirportId || f1.arrivalAirport?.code || "").toUpperCase();
          if (mid && mid !== arrUpper) {
            const leg2s = allData.filter(f2 => 
              (f2.departureAirportId?.toUpperCase() === mid || f2.departureAirport?.code?.toUpperCase() === mid) &&
              (f2.arrivalAirportId?.toUpperCase() === arrUpper || f2.arrivalAirport?.code?.toUpperCase() === arrUpper)
            );
            if (leg2s.length > 0) {
              viaAirports.add(mid);
              if (!connectingFlights.some(f => f.id === f1.id)) connectingFlights.push(f1);
              leg2s.forEach(f2 => {
                if (!connectingFlights.some(f => f.id === f2.id)) connectingFlights.push(f2);
              });
            }
          }
        }

        if (connectingFlights.length > 0) {
          setFlights(connectingFlights);
          setFlightError(`No direct flights for ${depUpper} → ${arrUpper}. Found indirect 1-stop connecting flights via ${Array.from(viaAirports).join(', ')} below:`);
        } else {
          setFlights([]);
          setFlightError(`No way to reach ${arrUpper} from ${depUpper} (no direct or indirect connecting flights available).`);
        }
      } catch {
        setFlights([]);
        setFlightError(`No way to reach ${arrivalCode.toUpperCase()} from ${departureCode.toUpperCase()}.`);
      }
    } finally {
      setLoadingFlights(false);
    }
  };

  const selectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setNoOfSeats(travellers || 1);
    setIdempotencyKey(generateIdempotencyKey());
    setStep("CONFIRM");
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;

    setBookingStatus("LOADING");

    try {
      const booking = await createBooking({
        flightId: selectedFlight.id,
        userId: Number(userId) || 1,
        noOfSeats: noOfSeats,
        idempotencyKey,
      });
      setBookingData(booking);
      setBookingStatus("SUCCESS");
      setStep("SUCCESS");
    } catch (err: any) {
      setBookingStatus("ERROR");
      if (err?.response?.status === 409) {
        setBookingMessage("Idempotency conflict: This booking request was already processed.");
      } else {
        setBookingMessage(
          err?.response?.data?.error?.explanation ||
          err?.response?.data?.message ||
          "Booking failed. Make sure both backend services are running (Port 3000 & 4000)."
        );
      }
      setStep("ERROR");
    }
  };

  const handlePayment = async () => {
    if (!bookingData) return;
    setPaymentStatus("LOADING");
    setPaymentMessage("");

    try {
      const updatedBooking = await makePayment({
        bookingId: bookingData.id,
        userId: bookingData.userId,
        totalCost: bookingData.totalCost,
        idempotencyKey: generateIdempotencyKey(),
        recepientEmail: recipientEmail || "akshanshranjan007@gmail.com",
        travelDate: departureDate || new Date().toISOString().split("T")[0],
      });
      setBookingData(updatedBooking);
      setPaymentStatus("SUCCESS");
    } catch (err: any) {
      setPaymentStatus("ERROR");
      setPaymentMessage(
        err?.response?.data?.message ||
        err?.response?.data?.error?.explanation ||
        "Payment transaction failed. Ensure Booking & Notification services are running."
      );
    }
  };

  const totalFare = selectedFlight ? selectedFlight.price * noOfSeats : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100">

        {/* ── Header ── */}
        <div className="bg-[#202A36] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Book a Flight</h3>
              <p className="text-xs text-gray-300">
                {step === "SEARCH" && "Search routes"}
                {step === "SELECT" && "Choose your flight"}
                {step === "CONFIRM" && `Confirm — ${selectedFlight?.flightNumber}`}
                {step === "SUCCESS" && "Booking Confirmed!"}
                {step === "ERROR" && "Booking Failed"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {(["SEARCH", "SELECT", "CONFIRM"] as Step[]).map((s, i) => (
                <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step === s ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">

          {/* ── STEP 1: SEARCH ── */}
          {step === "SEARCH" && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Departure */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    From (Airport Code)
                  </label>
                  <div className="relative">
                    <select
                      value={departureCode}
                      onChange={e => setDepartureCode(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#202A36]/20 text-sm appearance-none"
                    >
                      <option value="">Select Departure</option>
                      {airports.map(a => (
                        <option key={a.id} value={a.code}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Arrival */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    To (Airport Code)
                  </label>
                  <div className="relative">
                    <select
                      value={arrivalCode}
                      onChange={e => setArrivalCode(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#202A36]/20 text-sm appearance-none"
                    >
                      <option value="">Select Arrival</option>
                      {airports.map(a => (
                        <option key={a.id} value={a.code}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Departure Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={e => setDepartureDate(e.target.value)}
                    min={formatDate(new Date().toISOString())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#202A36]/20 text-sm"
                  />
                </div>

                {/* Travellers */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Travellers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={travellers}
                      onChange={e => setTravellers(Math.max(1, Number(e.target.value)))}
                      min={1}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#202A36]/20 text-sm"
                    />
                  </div>
                </div>
              </div>

              {flightError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{flightError}</span>
                </div>
              )}

              <button
                onClick={searchFlights}
                disabled={!departureCode || !arrivalCode}
                className="w-full py-3.5 rounded-xl bg-[#202A36] hover:bg-[#1a2229] text-white font-medium shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
                Search Flights
              </button>
            </div>
          )}

          {/* ── STEP 2: SELECT FLIGHT ── */}
          {step === "SELECT" && (
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {departureCode} → {arrivalCode}
                    {departureDate && <span className="text-gray-500 font-normal"> · {departureDate}</span>}
                  </p>
                  <p className="text-xs text-gray-500">{travellers} traveller{travellers > 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => { setStep("SEARCH"); setFlightError(""); }}
                  className="text-xs text-[#202A36] font-semibold hover:underline flex items-center gap-1"
                >
                  ← Modify Search
                </button>
              </div>

              {loadingFlights && (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Searching available flights...</span>
                </div>
              )}

              {!loadingFlights && flightError && flights.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plane className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{flightError}</p>
                  <button onClick={() => setStep("SEARCH")} className="text-sm text-[#202A36] font-semibold hover:underline">
                    Try a different route
                  </button>
                </div>
              )}

              {!loadingFlights && flightError && flights.length > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Route Notice:</span>
                    <span>{flightError}</span>
                  </div>
                </div>
              )}

              {!loadingFlights && flights.length > 0 && flights.map(flight => {
                const depAirport = flight.departureAirport;
                const arrAirport = flight.arrivalAirport;
                const durationMins = flightDurationMins(flight.departureTime, flight.arrivalTime);
                const hours = Math.floor(durationMins / 60);
                const mins = durationMins % 60;

                return (
                  <div
                    key={flight.id}
                    onClick={() => selectFlight(flight)}
                    className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-[#202A36] hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {flight.flightNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        {flight.airplane?.modelNumber || "Aircraft"} · Gate {flight.boardngGate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Departure */}
                      <div className="flex-1 text-left">
                        <p className="text-2xl font-bold text-gray-900">{flight.departureAirportId}</p>
                        <p className="text-xs text-gray-500 truncate">{depAirport?.name || flight.departureAirportId}</p>
                        <p className="text-sm font-medium text-gray-700 mt-0.5">{formatTime(flight.departureTime, departureDate || undefined)}</p>
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col items-center gap-1 px-2">
                        <p className="text-xs text-gray-400">{hours}h {mins}m</p>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full border-2 border-gray-400" />
                          <div className="w-12 h-px bg-gray-300" />
                          <Plane className="w-3.5 h-3.5 text-[#202A36] transform -rotate-45" />
                          <div className="w-12 h-px bg-gray-300" />
                          <div className="w-2 h-2 rounded-full bg-[#202A36]" />
                        </div>
                        <p className="text-xs text-gray-400">Non-stop</p>
                      </div>

                      {/* Arrival */}
                      <div className="flex-1 text-right">
                        <p className="text-2xl font-bold text-gray-900">{flight.arrivalAirportId}</p>
                        <p className="text-xs text-gray-500 truncate">{arrAirport?.name || flight.arrivalAirportId}</p>
                        <p className="text-sm font-medium text-gray-700 mt-0.5">{formatTime(flight.arrivalTime, departureDate || undefined)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>{flight.totalSeats} seats left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#202A36]">₹{flight.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">/ seat</span>
                        <ArrowRight className="w-4 h-4 text-[#202A36] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP 3: CONFIRM BOOKING ── */}
          {step === "CONFIRM" && selectedFlight && (
            <form onSubmit={submitBooking} className="p-6 space-y-4">
              {/* Flight Summary Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selected Flight</span>
                  <button type="button" onClick={() => setStep("SELECT")} className="text-xs text-[#202A36] font-semibold hover:underline">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{selectedFlight.departureAirportId} → {selectedFlight.arrivalAirportId}</p>
                    <p className="text-sm text-gray-500">{selectedFlight.flightNumber} · {formatTime(selectedFlight.departureTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#202A36]">₹{selectedFlight.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">per seat</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{selectedFlight.totalSeats} seats available</span>
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Passenger User ID
                </label>
                <input
                  type="number"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  min="1"
                  required
                  placeholder="Enter your user ID (e.g. 1)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#202A36]/20 text-sm"
                />
              </div>

              {/* Seats */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Number of Seats
                </label>
                <input
                  type="number"
                  value={noOfSeats}
                  onChange={e => setNoOfSeats(Math.max(1, Math.min(selectedFlight.totalSeats, Number(e.target.value))))}
                  min="1"
                  max={selectedFlight.totalSeats}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#202A36]/20 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Max {selectedFlight.totalSeats} seats available</p>
              </div>

              {/* Idempotency Key */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col gap-1.5 text-xs text-blue-900">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Anti-Duplicate Safety Key
                  </span>
                  <button
                    type="button"
                    onClick={() => setIdempotencyKey(generateIdempotencyKey())}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> New
                  </button>
                </div>
                <code className="bg-white/80 px-2 py-1 rounded border border-blue-200/60 font-mono text-gray-700 truncate">
                  {idempotencyKey}
                </code>
              </div>

              {/* Total Fare */}
              <div className="py-3.5 px-4 rounded-xl bg-[#202A36] text-white flex items-center justify-between">
                <span className="text-sm font-medium">Total Fare</span>
                <span className="text-2xl font-bold">₹{totalFare.toLocaleString()}</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={bookingStatus === "LOADING"}
                className="w-full py-3.5 rounded-xl bg-[#202A36] hover:bg-[#1a2229] text-white font-medium shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {bookingStatus === "LOADING" ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Processing Booking...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Confirm Flight Booking</>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 4: SUCCESS ── */}
          {step === "SUCCESS" && bookingData && (
            <div className="p-6">
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Seats deducted from inventory via ACID-safe 2-phase transaction.
                  </p>
                </div>
              </div>

              {/* Booking Receipt */}
              <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-[#202A36] text-white px-4 py-3 flex items-center justify-between">
                  <span className="font-bold text-sm">Booking Receipt</span>
                  <span className="text-xs text-green-400 font-semibold uppercase">✓ {bookingData.status}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "Booking ID", value: `#${bookingData.id}` },
                    { label: "Flight ID", value: bookingData.flightId },
                    { label: "User ID", value: bookingData.userId },
                    { label: "Seats", value: bookingData.noOfSeats },
                    { label: "Total Cost", value: `₹${bookingData.totalCost?.toLocaleString()}` },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-semibold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 2: ACID Payment & RabbitMQ Notification Action */}
              {paymentStatus !== "SUCCESS" ? (
                <div className="mt-5 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <span>Phase 2: ACID Payment & Notification</span>
                    <span className="text-blue-600">Pending Commit</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Execute payment verification (`POST /bookings/payments`) to update status to <strong className="font-semibold text-green-700">BOOKED</strong> and trigger an instant confirmation email via RabbitMQ.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-900 mb-1">
                      Recipient Email Address for E-Ticket Delivery
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/30">
                      <span className="text-gray-400 text-xs">✉️</span>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="e.g. akshanshranjan007@gmail.com"
                        className="w-full text-sm font-mono font-semibold text-gray-900 bg-transparent focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-blue-700 mt-1">
                      Default: <span className="font-mono underline">akshanshranjan007@gmail.com</span> — You can edit this above to test real-time ticket delivery!
                    </p>
                  </div>
                  {paymentMessage && (
                    <p className="text-xs text-red-600 font-medium">{paymentMessage}</p>
                  )}
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paymentStatus === "LOADING"}
                    className="w-full py-3.5 rounded-xl bg-[#ff2a2a] hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {paymentStatus === "LOADING" ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Executing Payment Transaction...</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Pay Now & Dispatch Flight Confirmation Email</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-5 p-4 rounded-2xl bg-green-50 border border-green-200 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>Payment Committed & Email Dispatched!</span>
                  </div>
                  <p className="text-xs text-green-700 leading-relaxed">
                    RabbitMQ (`Notification-Queue`) has processed the event envelope and Nodemailer delivered the detailed E-ticket directly to <strong className="font-mono underline">{recipientEmail || "akshanshranjan007@gmail.com"}</strong>.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setStep("SEARCH"); setBookingData(null); setBookingStatus("IDLE"); setPaymentStatus("IDLE"); setIdempotencyKey(generateIdempotencyKey()); }}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" /> Book Another
                </button>
                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#202A36] text-white font-medium hover:bg-[#1a2229] text-sm">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: ERROR ── */}
          {step === "ERROR" && (
            <div className="p-6 flex flex-col items-center text-center gap-4 py-10">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Booking Failed</h4>
                <p className="text-sm text-gray-600 mt-1 max-w-sm">{bookingMessage}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setIdempotencyKey(generateIdempotencyKey()); setStep("CONFIRM"); setBookingStatus("IDLE"); }}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm"
                >
                  Try Again
                </button>
                <button onClick={() => setStep("SEARCH")} className="flex-1 py-3 rounded-xl bg-[#202A36] text-white font-medium text-sm">
                  New Search
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
