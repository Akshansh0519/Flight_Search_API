"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Plane } from "lucide-react";

interface HeroProps {
  onOpenBooking: () => void;
  onOpenDiscover: () => void;
}

export default function Hero({ onOpenBooking, onOpenDiscover }: HeroProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section id="start" className="relative h-screen w-full overflow-hidden bg-gray-50">
      {/* Video Background container with client-only mounting to prevent browser extension (e.g. SpeedUpYPSC) hydration errors */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#202A36]">
        {isMounted && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-90 transition-opacity duration-1000"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
              type="video/mp4"
            />
            Your browser does not support HTML5 video.
          </video>
        )}
      </div>

      {/* Subtle Overlay to enhance text contrast while keeping cinematic brightness */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/30 to-transparent pointer-events-none" />

      {/* Content Wrapper */}
      <div className="relative h-full w-full flex flex-col justify-center items-center px-6 sm:px-8 text-center z-10">
        <div className="-mt-16 sm:-mt-24 flex flex-col items-center max-w-4xl">
          {/* Small Uppercase Label */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-gray-200/60 shadow-sm mb-4 animate-in fade-in duration-700">
            <Plane className="w-3.5 h-3.5 text-[#202A36]" />
            <span className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Flight Booking Service
            </span>
          </div>

          {/* Large Two-Line Heading with Overlapping Effect */}
          <div className="flex flex-col items-center select-none mb-6">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-normal text-gray-500 leading-none tracking-tighter drop-shadow-sm">
              Premium.
            </h1>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-[#202A36] leading-none tracking-tighter -mt-3 sm:-mt-4 drop-shadow-md">
              Accessible.
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-700 font-medium mb-8 max-w-2xl leading-relaxed drop-shadow-sm">
            Your dedication deserves recognition. Seamlessly search and reserve worldwide airline flights powered by our real-time dual microservice engine.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenDiscover}
              className="px-7 py-3 rounded-full bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition-colors duration-200 shadow-sm"
            >
              Explore Flights
            </button>
            <button
              onClick={onOpenBooking}
              className="group px-7 py-3 rounded-full text-white bg-[#202A36] hover:bg-[#1a2229] transition-all duration-200 shadow-xl flex items-center gap-2 hover:gap-3"
            >
              <span>Book Flight</span>
              <ArrowRight className="w-4 h-4 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
