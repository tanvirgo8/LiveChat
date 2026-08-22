'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { MessageSquare, Phone, User, Loader2, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: isAuthLoading, error: apiError, clearError } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefetch /chat route for fast instant navigation & redirect if already authenticated
  useEffect(() => {
    router.prefetch('/chat');
    if (!isAuthLoading && isAuthenticated) {
      router.replace('/chat');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();

    if (!trimmedPhone) {
      setValidationError('Please enter a phone number.');
      return;
    }

    if (!trimmedName) {
      setValidationError('Please enter your name.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(trimmedPhone, trimmedName);
      // Keep isSubmitting true on success during page transition to /chat
    } catch {
      // Error stored in apiError by AuthContext
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#000000] p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#503CF7]" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#000000] px-4 py-12 select-none transition-colors duration-200">
      {/* Top Floating Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Light Mode Soft Flowing Wave Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden dark:hidden">
        <svg
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lightWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lightWaveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lightWaveGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#b4d7ff" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          <path
            d="M-100,750 C200,850 450,550 850,700 C1250,850 1450,450 1600,200 L1600,1000 L-100,1000 Z"
            fill="url(#lightWaveGrad1)"
          />
          <path
            d="M-50,600 C300,700 600,400 1000,650 C1300,800 1500,300 1650,50 L1650,1000 L-50,1000 Z"
            fill="url(#lightWaveGrad2)"
          />
          <path
            d="M700,-100 C950,120 1200,80 1420,320 C1550,480 1650,650 1750,800 L1750,-100 Z"
            fill="url(#lightWaveGrad3)"
          />
        </svg>
      </div>

      {/* Dark Mode Minimal Minimal Shade Background (#503CF7 & #A64AFF on Pitch Black #000000) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden dark:block">
        {/* Subtle Wave Curves with #503CF7 and #A64AFF */}
        <svg
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="darkMinimalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#503CF7" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#A64AFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="darkMinimalGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A64AFF" stopOpacity="0.16" />
              <stop offset="70%" stopColor="#503CF7" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Minimal Wave Path 1 (#503CF7) */}
          <path
            d="M-100,750 C200,850 450,550 850,700 C1250,850 1450,450 1600,200 L1600,1000 L-100,1000 Z"
            fill="url(#darkMinimalGrad1)"
          />
          {/* Minimal Wave Path 2 (#A64AFF) */}
          <path
            d="M-50,600 C300,700 600,400 1000,650 C1300,800 1500,300 1650,50 L1650,1000 L-50,1000 Z"
            fill="url(#darkMinimalGrad2)"
          />
        </svg>

        {/* Minimal Soft Ambient Glowing Orbs on Pitch Black (#503CF7 & #A64AFF) */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#503CF7]/15 blur-[140px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-[#A64AFF]/12 blur-[140px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c0d14]/90 p-8 sm:p-10 shadow-2xl dark:shadow-[0_0_50px_-10px_rgba(80,60,247,0.25)] backdrop-blur-2xl transition-all">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#503CF7] to-[#A64AFF] text-white shadow-lg shadow-[#503CF7]/30 ring-1 ring-white/20">
            <MessageSquare className="h-8 w-8" />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#000000] ring-1 ring-slate-200 dark:ring-slate-800">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            </div>
          </div>

          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-300">
            Welcome to LiveChat
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Connect and chat with anyone instantly
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#503CF7]/10 px-3 py-1 text-[11px] font-semibold text-[#503CF7] dark:text-[#A64AFF] ring-1 ring-[#503CF7]/20">
            <ShieldCheck className="h-3.5 w-3.5 text-[#503CF7] dark:text-[#A64AFF]" />
            <span>Automatic registration for new numbers</span>
          </div>
        </div>

        {/* Non-blocking Error Banner */}
        {(validationError || apiError) && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
            <div className="text-xs sm:text-sm text-red-600 dark:text-red-300 leading-snug">
              {validationError || apiError}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <div className="group relative rounded-2xl transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 group-focus-within:text-[#503CF7] dark:group-focus-within:text-[#A64AFF] transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full rounded-2xl border-0 bg-slate-100/70 dark:bg-[#000000]/80 py-3.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 transition focus:bg-white dark:focus:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-[#503CF7] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="group relative rounded-2xl transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 group-focus-within:text-[#503CF7] dark:group-focus-within:text-[#A64AFF] transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full rounded-2xl border-0 bg-slate-100/70 dark:bg-[#000000]/80 py-3.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 transition focus:bg-white dark:focus:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-[#503CF7] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#503CF7] via-[#6366f1] to-[#A64AFF] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#503CF7]/30 transition-all duration-200 ease-in-out hover:opacity-95 hover:shadow-[#503CF7]/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#503CF7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Signing in...</span>
              </span>
            ) : (
              <>
                <span>Continue to LiveChat</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Badge */}
        <div className="pt-2 text-center border-t border-slate-200/80 dark:border-slate-800/60">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Secure • Real-time • Built for seamless communication
          </p>
        </div>
      </div>
    </div>
  );
}
