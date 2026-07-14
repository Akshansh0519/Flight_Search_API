"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ArchitectureHub from "@/components/ArchitectureHub";
import BookingModal from "@/components/BookingModal";
import DiscoverModal from "@/components/DiscoverModal";
import AuthModal from "@/components/AuthModal";
import BackendStatusBanner from "@/components/BackendStatusBanner";

export default function Home() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [discoverModalOpen, setDiscoverModalOpen] = useState(false);
  const [discoverModalTab, setDiscoverModalTab] = useState<"EXPLORE" | "FAQ">("EXPLORE");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("skyelite_user_email"));
      const handleAuthChange = () => {
        setUserEmail(localStorage.getItem("skyelite_user_email"));
      };
      window.addEventListener("auth_change", handleAuthChange);
      return () => window.removeEventListener("auth_change", handleAuthChange);
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Navigation Bar */}
      <Navbar
        onOpenBooking={() => setBookingModalOpen(true)}
        onOpenDiscover={() => { setDiscoverModalTab("EXPLORE"); setDiscoverModalOpen(true); }}
        onOpenFAQ={() => { setDiscoverModalTab("FAQ"); setDiscoverModalOpen(true); }}
        onOpenAuth={() => setAuthModalOpen(true)}
        userEmailProp={userEmail}
        onLogoutProp={() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("skyelite_user_email");
            localStorage.removeItem("jwt_token");
            setUserEmail(null);
            window.dispatchEvent(new Event("auth_change"));
          }
        }}
      />

      {/* Full-screen Hero Section */}
      <Hero
        onOpenBooking={() => setBookingModalOpen(true)}
        onOpenDiscover={() => { setDiscoverModalTab("EXPLORE"); setDiscoverModalOpen(true); }}
      />

      {/* Interactive Microservice & Architecture Hub (from DESIGN_SYSTEM_AND_UI_GUIDE.md) */}
      <ArchitectureHub
        onOpenBooking={() => setBookingModalOpen(true)}
        onOpenDiscover={() => { setDiscoverModalTab("EXPLORE"); setDiscoverModalOpen(true); }}
      />

      {/* Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(email) => {
          setUserEmail(email);
          window.dispatchEvent(new Event("auth_change"));
        }}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      <DiscoverModal
        isOpen={discoverModalOpen}
        onClose={() => setDiscoverModalOpen(false)}
        onOpenBooking={() => setBookingModalOpen(true)}
        defaultTab={discoverModalTab}
      />

      <BackendStatusBanner />
    </main>
  );
}
