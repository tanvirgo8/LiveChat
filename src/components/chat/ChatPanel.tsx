import React from 'react';
import { Conversation, Message } from '@/types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyChatState } from './EmptyChatState';
import { MessageSkeleton } from './MessageSkeleton';
import { ArrowLeft } from 'lucide-react';

interface ChatPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  isLoadingConversations?: boolean;
  isLoadingMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  hasMoreMessages?: boolean;
  messagesError?: string | null;
  onRetryMessages?: () => void;
  onLoadOlderMessages?: () => void;
  onBackMobile?: () => void;
  onOpenGroupInfo?: () => void;
  onSendMessage?: (text: string) => Promise<void>;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  conversation,
  messages,
  currentUserId,
  isLoadingConversations = false,
  isLoadingMessages = false,
  isLoadingOlderMessages = false,
  hasMoreMessages = false,
  messagesError = null,
  onRetryMessages,
  onLoadOlderMessages,
  onBackMobile,
  onOpenGroupInfo,
  onSendMessage,
}) => {
  // Directly render Chat Inbox Skeleton if conversations or messages are loading to prevent EmptyChatState flash
  if (isLoadingConversations || (!conversation && isLoadingMessages)) {
    return (
      <main className="flex h-full max-h-full w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Chat Header Skeleton */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl animate-pulse">
          <div className="flex items-center gap-3">
            {onBackMobile && (
              <button
                type="button"
                onClick={onBackMobile}
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Message Skeleton List Body */}
        <MessageSkeleton />

        {/* Disabled Message Input Container */}
        <MessageInput isDisabled={true} />
      </main>
    );
  }

  if (!conversation) {
    return <EmptyChatState />;
  }

  return (
    <main className="flex h-full max-h-full w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <ChatHeader
        conversation={conversation}
        onBackMobile={onBackMobile}
        onOpenGroupInfo={onOpenGroupInfo}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        conversation={conversation}
        isLoading={isLoadingMessages}
        isLoadingOlder={isLoadingOlderMessages}
        hasMore={hasMoreMessages}
        error={messagesError}
        onRetry={onRetryMessages}
        onLoadOlder={onLoadOlderMessages}
      />
      <MessageInput onSendMessage={onSendMessage} />
    </main>
  );
};
