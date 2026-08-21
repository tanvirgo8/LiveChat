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

  // Redirect if already authenticated
  useEffect(() => {
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
    } catch {
      // Error stored in apiError by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-12 select-none transition-colors duration-200">
      {/* Top Floating Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Dynamic Background Ambient Glowing Orbs Animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Glowing Indigo Orb */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 dark:bg-indigo-600/20 blur-[120px] animate-pulse" />
        {/* Glowing Purple Orb */}
        <div className="absolute top-1/2 -right-40 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-purple-600/15 dark:bg-purple-600/20 blur-[120px] animate-pulse [animation-delay:2s]" />
        {/* Glowing Cyan/Blue Bottom Orb */}
        <div className="absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-[100px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 p-8 sm:p-10 shadow-2xl dark:shadow-[0_0_50px_-12px_rgba(79,70,229,0.25)] backdrop-blur-2xl transition-all">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <MessageSquare className="h-8 w-8" />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-950 ring-1 ring-slate-300 dark:ring-slate-800">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            </div>
          </div>

          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-300">
            Welcome to LiveChat
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Real-time 1-to-1 & group messaging platform
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
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
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
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
                  className="block w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-950/80 py-3.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 transition focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="group relative rounded-2xl transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
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
                  className="block w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-950/80 py-3.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 transition focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 ease-in-out hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800/60">
          <p className="text-[11px] text-slate-500">
            Powered by Next.js & Socket.IO Real-Time Engine
          </p>
        </div>
      </div>
    </div>
  );
}
