"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ArchitectureHub from "@/components/ArchitectureHub";
import BookingModal from "@/components/BookingModal";
import DiscoverModal from "@/components/DiscoverModal";

export default function Home() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [discoverModalOpen, setDiscoverModalOpen] = useState(false);

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Navigation Bar */}
      <Navbar
        onOpenBooking={() => setBookingModalOpen(true)}
        onOpenDiscover={() => setDiscoverModalOpen(true)}
      />

      {/* Full-screen Hero Section */}
      <Hero
        onOpenBooking={() => setBookingModalOpen(true)}
        onOpenDiscover={() => setDiscoverModalOpen(true)}
      />

      {/* Interactive Microservice & Architecture Hub (from DESIGN_SYSTEM_AND_UI_GUIDE.md) */}
      <ArchitectureHub
        onOpenBooking={() => setBookingModalOpen(true)}
        onOpenDiscover={() => setDiscoverModalOpen(true)}
      />

      {/* Interactive Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      <DiscoverModal
        isOpen={discoverModalOpen}
        onClose={() => setDiscoverModalOpen(false)}
        onOpenBooking={() => setBookingModalOpen(true)}
      />
    </main>
  );
}
