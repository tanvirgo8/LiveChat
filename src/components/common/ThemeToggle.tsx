'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 select-none ${
        isDark
          ? 'bg-slate-800/80 text-amber-400 hover:bg-slate-800 hover:text-amber-300 ring-1 ring-white/10'
          : 'bg-slate-200/80 text-indigo-600 hover:bg-slate-200 hover:text-indigo-700 ring-1 ring-slate-300'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 animate-in rotate-90 duration-200" />
      ) : (
        <Moon className="h-4.5 w-4.5 animate-in -rotate-90 duration-200" />
      )}
    </button>
  );
};
