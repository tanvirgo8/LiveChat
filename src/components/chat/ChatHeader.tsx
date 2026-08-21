import React from 'react';
import { Conversation } from '@/types';
import { getInitials } from '@/lib/utils';
import { ArrowLeft, Users, Phone, Info } from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  onBackMobile?: () => void;
  onOpenGroupInfo?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onBackMobile,
  onOpenGroupInfo,
}) => {
  const isGroup = conversation.type === 'group';
  const title = isGroup ? conversation.name : conversation.participant.name;
  const initials = getInitials(title);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-4 sm:px-6 backdrop-blur-xl select-none transition-colors duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Mobile Back Button */}
        <button
          type="button"
          onClick={onBackMobile}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Avatar */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold shadow-sm ${
            isGroup
              ? 'bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/40'
              : 'bg-gradient-to-tr from-indigo-600/30 to-blue-600/30 text-indigo-700 dark:text-indigo-200 ring-1 ring-indigo-500/40'
          }`}
        >
          {initials}
        </div>

        {/* Info Text */}
        <div className="flex flex-col min-w-0">
          <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {isGroup ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-300">
                <Users className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                {conversation.participants.length} members
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                {conversation.participant.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Options Area */}
      <div className="flex items-center gap-2">
        {isGroup && onOpenGroupInfo && (
          <button
            type="button"
            onClick={onOpenGroupInfo}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-300 ring-1 ring-slate-200 dark:ring-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-sm"
            title="Group Info & Settings"
            aria-label="Group Info & Settings"
          >
            <Info className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </header>
  );
};
