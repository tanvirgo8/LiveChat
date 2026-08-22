import React from 'react';
import { Conversation, User } from '@/types';
import { ConversationList } from './ConversationList';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { MessageSquare, LogOut, Phone, Zap } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { SocketStatus } from '@/hooks/useSocket';

interface ChatSidebarProps {
  user: User | null;
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onLogout: () => void;
  isLoading?: boolean;
  onOpenNewChatModal?: () => void;
  onOpenGroupModal?: () => void;
  socketStatus?: SocketStatus;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  user,
  conversations,
  selectedId,
  onSelectConversation,
  onLogout,
  isLoading = false,
  onOpenNewChatModal,
  onOpenGroupModal,
  socketStatus = 'disconnected',
}) => {
  const userInitials = getInitials(user?.name);

  // Helper for rendering socket connection state
  const renderSocketBadge = () => {
    switch (socketStatus) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Live
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
            Connecting...
          </span>
        );
      case 'reconnecting':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            Reconnecting...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400 ring-1 ring-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400" />
            Connection Error
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            Offline
          </span>
        );
    }
  };

  return (
    <aside className="flex h-full max-h-full w-full flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl select-none transition-colors duration-200 overflow-hidden">
      {/* Top Branding Header (Pinned) */}
      <div className="shrink-0 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <MessageSquare className="h-5 w-5" />
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-950 ring-1 ring-slate-300 dark:ring-slate-800">
              <Zap className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-300">
              LiveChat
            </h1>
            {renderSocketBadge()}
          </div>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />
      </div>

      {/* Conversation List Container (Scrollable Flex Item) */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelectConversation}
        isLoading={isLoading}
        onOpenNewChatModal={onOpenNewChatModal}
        onOpenGroupModal={onOpenGroupModal}
      />

      {/* User Profile Footer Section (Pinned to Bottom) */}
      <div className="shrink-0 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/90 dark:bg-slate-950/90 p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 text-xs font-extrabold text-indigo-700 dark:text-indigo-200 ring-1 ring-indigo-500/40 shadow-inner">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
              {user?.name || 'Guest User'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Phone className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{user?.phone || 'No phone'}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shrink-0"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </aside>
  );
};
