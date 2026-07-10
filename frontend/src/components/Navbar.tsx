"use client";

import React, { useState } from "react";
import { Menu, X, Plane } from "lucide-react";

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenDiscover: () => void;
  onOpenAuth?: () => void;
  userEmailProp?: string | null;
  onLogoutProp?: () => void;
}

export default function Navbar({ onOpenBooking, onOpenDiscover, onOpenAuth, userEmailProp, onLogoutProp }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(userEmailProp || null);

  React.useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("skyelite_user_email");
        setUserEmail(stored);
      }
    };
    checkAuth();
    window.addEventListener("auth_change", checkAuth);
    return () => window.removeEventListener("auth_change", checkAuth);
  }, []);

  React.useEffect(() => {
    if (userEmailProp !== undefined) {
      setUserEmail(userEmailProp);
    }
  }, [userEmailProp]);

  const handleLogout = () => {
    if (onLogoutProp) {
      onLogoutProp();
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("skyelite_user_email");
      localStorage.removeItem("jwt_token");
      setUserEmail(null);
      window.dispatchEvent(new Event("auth_change"));
    }
  };

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
          {userEmail ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full px-3.5 py-1.5 shadow-sm animate-in fade-in duration-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-950 font-bold text-xs">
                👤 {userEmail.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="ml-1 px-2 py-0.5 rounded-md bg-red-100 hover:bg-red-200 text-red-700 font-extrabold text-[10px] uppercase tracking-wider transition-colors"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-full border border-[#202A36]/30 text-[#202A36] bg-white/80 hover:bg-[#202A36] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              🔐 Sign In / Sign Up
            </button>
          )}
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
            {userEmail ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-950 font-bold text-sm">
                    👤 {userEmail.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); if (onOpenAuth) onOpenAuth(); }}
                className="w-full py-3 rounded-xl border-2 border-[#202A36] text-[#202A36] font-bold text-center shadow-sm"
              >
                🔐 Sign In / Sign Up
              </button>
            )}
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
