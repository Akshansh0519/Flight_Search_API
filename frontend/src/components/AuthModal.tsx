"use client";

import React, { useState } from "react";
import { X, Mail, Lock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { signinUser, signupUser, setAuthToken } from "../lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        // Step 1: Sign up
        await signupUser(email, password);
        setSuccessMsg("Account created successfully! Signing you in...");
        
        // Step 2: Auto Sign in right after signup
        const { token } = await signinUser(email, password);
        setAuthToken(token);
        localStorage.setItem("skyelite_user_email", email);
        window.dispatchEvent(new Event("auth_change"));
        
        setTimeout(() => {
          onLoginSuccess(email);
          onClose();
        }, 1200);
      } else {
        // Sign in
        const { token } = await signinUser(email, password);
        setAuthToken(token);
        localStorage.setItem("skyelite_user_email", email);
        window.dispatchEvent(new Event("auth_change"));
        
        setSuccessMsg("Signed in successfully via JWT!");
        setTimeout(() => {
          onLoginSuccess(email);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Authentication failed. Please check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Header Banner */}
        <div className="bg-[#202A36] text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" />
            API Gateway JWT Authentication
          </div>
          <h3 className="text-2xl font-black text-white">
            {isSignUp ? "Create SkyElite Account" : "Welcome Back to SkyElite"}
          </h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            All requests are securely authenticated via JWT headers and routed through our centralized rate-limited API Gateway.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-sm font-bold text-center transition-all ${
              !isSignUp
                ? "text-[#202A36] border-b-2 border-[#202A36] bg-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-sm font-bold text-center transition-all ${
              isSignUp
                ? "text-[#202A36] border-b-2 border-[#202A36] bg-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100 flex items-center gap-2.5 animate-in shake">
              <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="passenger@skyelite.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#202A36] focus:ring-2 focus:ring-[#202A36]/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#202A36] focus:ring-2 focus:ring-[#202A36]/10 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="mt-2 w-full py-3.5 bg-[#202A36] hover:bg-[#151c24] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#202A36]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white/40 border-t-white rounded-full w-4 h-4"></span>
            ) : isSignUp ? (
              <>
                Register & Authenticate <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Sign In with JWT <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center text-[11px] text-gray-400 font-medium">
          Protected by SkyElite API Gateway • Port 5000 Rate Limiter & Token Validator
        </div>
      </div>
    </div>
  );
}
