import React from 'react';
import { Conversation } from '@/types';
import { getInitials, formatConversationTimestamp } from '@/lib/utils';
import { Users, User as UserIcon } from 'lucide-react';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onSelect,
}) => {
  const isGroup = conversation.type === 'group';

  // Display title & avatar
  const title = isGroup ? conversation.name : conversation.participant.name;
  const initials = getInitials(title);

  // Last message preview text & date
  const lastMsgText = conversation.lastMessage?.text || 'No messages yet';
  const timestamp = formatConversationTimestamp(conversation.updatedAt || conversation.lastMessage?.createdAt);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation._id)}
      className={`group relative flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isSelected
          ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-950 dark:text-white ring-1 ring-indigo-500/40 shadow-sm'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
      }`}
      aria-label={`Select conversation with ${title}`}
    >
      {/* Active Indicator Accent Bar */}
      {isSelected && (
        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_12px_#6366f1]" />
      )}

      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-extrabold transition-transform duration-200 group-hover:scale-105 ${
            isGroup
              ? 'bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/30'
              : 'bg-gradient-to-tr from-indigo-600/20 to-blue-600/20 text-indigo-700 dark:text-indigo-200 ring-1 ring-indigo-500/30'
          }`}
        >
          {initials}
        </div>
        
        {/* Group / Direct Badge Indicator */}
        <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
          {isGroup ? (
            <Users className="h-2.5 w-2.5 text-purple-500 dark:text-purple-400" />
          ) : (
            <UserIcon className="h-2.5 w-2.5 text-indigo-500 dark:text-indigo-400" />
          )}
        </div>
      </div>

      {/* Info & Last Message */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white">
            {title}
          </span>
          <span className="shrink-0 text-[10px] font-semibold text-slate-400 dark:text-slate-400">
            {timestamp}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
            {lastMsgText}
          </p>
          {isGroup && (
            <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/20">
              {conversation.participants.length} members
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
