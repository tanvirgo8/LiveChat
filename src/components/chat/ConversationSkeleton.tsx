import React from 'react';

export const ConversationSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 px-3 py-2">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl bg-slate-200/50 dark:bg-slate-900/40 p-3 ring-1 ring-slate-200 dark:ring-white/5 animate-pulse"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-300 dark:bg-slate-800" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 rounded bg-slate-300 dark:bg-slate-800" />
              <div className="h-3 w-10 rounded bg-slate-300 dark:bg-slate-800" />
            </div>
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
};
