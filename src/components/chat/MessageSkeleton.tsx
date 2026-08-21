import React from 'react';

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col justify-end p-4 space-y-4 animate-pulse bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="flex items-start gap-2.5 max-w-[65%]">
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="h-12 w-48 rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
      </div>

      <div className="flex justify-end">
        <div className="h-10 w-56 rounded-2xl bg-indigo-200/50 dark:bg-indigo-900/40" />
      </div>

      <div className="flex items-start gap-2.5 max-w-[65%]">
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="h-16 w-64 rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
      </div>

      <div className="flex justify-end">
        <div className="h-12 w-44 rounded-2xl bg-indigo-200/50 dark:bg-indigo-900/40" />
      </div>
    </div>
  );
};
