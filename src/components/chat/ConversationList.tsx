import React, { useState } from 'react';
import { Conversation } from '@/types';
import { ConversationListItem } from './ConversationListItem';
import { ConversationSkeleton } from './ConversationSkeleton';
import { Search, MessageSquarePlus, Users, MessageSquare } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  onOpenNewChatModal?: () => void;
  onOpenGroupModal?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  isLoading = false,
  onOpenNewChatModal,
  onOpenGroupModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by searchQuery
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (conv.type === 'group') {
      return conv.name.toLowerCase().includes(q);
    }
    return conv.participant.name.toLowerCase().includes(q) || conv.participant.phone.includes(q);
  });

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      {/* Action Bar & Search Header */}
      <div className="shrink-0 p-3 space-y-2.5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Messages
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenNewChatModal}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/20 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/30 transition hover:bg-indigo-600/20 dark:hover:bg-indigo-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Start 1-to-1 Conversation"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </button>
            <button
              type="button"
              onClick={onOpenGroupModal}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600/10 dark:bg-purple-600/20 px-2.5 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/30 transition hover:bg-purple-600/20 dark:hover:bg-purple-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Create New Group"
            >
              <Users className="h-3.5 w-3.5" />
              <span>New Group</span>
            </button>
          </div>
        </div>

        {/* Search Input Filter */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Conversation Items List Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <ConversationSkeleton />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 ring-1 ring-slate-200 dark:ring-white/5">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-300">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {searchQuery ? 'Try searching for another user or group.' : 'Start a chat or create a group to begin messaging.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationListItem
              key={conv._id}
              conversation={conv}
              isSelected={conv._id === selectedId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};
