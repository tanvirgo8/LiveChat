import React from 'react';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

export const EmptyChatState: React.FC = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 p-8 text-center select-none transition-colors duration-200">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-600/30 ring-1 ring-white/20">
            <MessageSquare className="h-10 w-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800 shadow-md">
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          </div>
        </div>

        <h2 className="mt-6 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-300">
          Your Conversations Live Here
        </h2>
        <p className="mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Select a conversation from the sidebar or start a new 1-to-1 or group chat to begin messaging in real time.
        </p>

        <div className="mt-8 flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 shadow-lg backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          <span>Real-time Socket.IO communication active</span>
        </div>
      </div>
    </div>
  );
};
