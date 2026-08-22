'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Loader2, Zap } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200 select-none">
        <div className="flex flex-col items-center text-center">
          {/* Brand Logo with Pulsing Shadow */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 animate-pulse">
            <MessageSquare className="h-8 w-8" />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800">
              <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-300">
            LiveChat
          </h1>

          {/* Custom Pill Loader */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20 shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500 dark:text-indigo-400" />
            <span>Connecting to LiveChat...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
