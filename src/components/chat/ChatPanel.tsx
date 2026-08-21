import React from 'react';
import { Conversation, Message } from '@/types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyChatState } from './EmptyChatState';

interface ChatPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
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
  if (!conversation) {
    return <EmptyChatState />;
  }

  return (
    <main className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
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
