"use client";

import React, { useState } from "react";
import { Menu, X, Plane } from "lucide-react";

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenDiscover: () => void;
  onOpenAuth?: () => void;
}

export default function Navbar({ onOpenBooking, onOpenDiscover, onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("skyelite_user_email");
      if (stored) setUserEmail(stored);
    }
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#202A36] text-white flex items-center justify-center shadow-lg group-hover:bg-gray-800 transition-colors">
            <Plane className="w-5 h-5 transform -rotate-45" />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-gray-900 drop-shadow-sm">
            SkyElite Flights
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-900">
          <a href="#start" className="hover:text-gray-600 transition-colors">
            Start
          </a>
          <a href="#architecture" className="hover:text-gray-600 transition-colors">
            Architecture
          </a>
          <button onClick={onOpenDiscover} className="hover:text-gray-600 transition-colors">
            Destinations & Routes
          </button>
          <button onClick={onOpenBooking} className="hover:text-gray-600 transition-colors">
            Flight Schedule
          </button>
          <button onClick={onOpenDiscover} className="hover:text-gray-600 transition-colors">
            Benefits
          </button>
          <button onClick={onOpenDiscover} className="hover:text-gray-600 transition-colors">
            FAQ
          </button>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-full border border-[#202A36]/30 text-[#202A36] text-xs font-bold hover:bg-[#202A36]/5 transition-all flex items-center gap-1.5"
          >
            {userEmail ? `👤 ${userEmail.split('@')[0]}` : "🔐 Sign In / Sign Up"}
          </button>
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-full bg-[#202A36] text-white text-sm font-medium hover:bg-[#1a2229] shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            Book Flight
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white transition-colors shadow-sm"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-6 mt-2 p-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <a
            href="#start"
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-900 font-medium hover:text-gray-600 transition-colors py-1"
          >
            Start
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-900 font-medium hover:text-gray-600 transition-colors py-1"
          >
            Architecture & Microservices
          </a>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenDiscover(); }}
            className="text-left text-gray-900 font-medium hover:text-gray-600 transition-colors py-1"
          >
            Destinations & Routes
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
            className="text-left text-gray-900 font-medium hover:text-gray-600 transition-colors py-1"
          >
            Flight Schedule & Booking
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenDiscover(); }}
            className="text-left text-gray-900 font-medium hover:text-gray-600 transition-colors py-1"
          >
            Benefits & FAQ
          </button>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
              className="w-full py-3 rounded-xl bg-[#202A36] text-white text-center font-medium shadow-md"
            >
              Book Flight
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
