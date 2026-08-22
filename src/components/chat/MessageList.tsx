import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Message, Conversation, User } from '@/types';
import { MessageItem } from './MessageItem';
import { MessageSkeleton } from './MessageSkeleton';
import { MessageSquareDashed, AlertCircle, RefreshCw, Loader2, ArrowUpCircle, ArrowDown } from 'lucide-react';

const BOTTOM_THRESHOLD_PX = 100;

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversation: Conversation;
  isLoading?: boolean;
  isLoadingOlder?: boolean;
  hasMore?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onLoadOlder?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  conversation,
  isLoading = false,
  isLoadingOlder = false,
  hasMore = false,
  error = null,
  onRetry,
  onLoadOlder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout tracking refs
  const prevScrollHeightRef = useRef<number>(0);
  const prevMessagesCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const isPaginationLoadRef = useRef<boolean>(false);

  // New messages floating indicator state
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState<boolean>(false);

  const isGroup = conversation.type === 'group';

  // Group participant map for sender names
  const participantMap = React.useMemo(() => {
    const map = new Map<string, User>();
    if (isGroup) {
      conversation.participants.forEach((p) => map.set(p._id, p));
    }
    return map;
  }, [isGroup, conversation]);

  // Reset scroll tracking when switching active conversation
  useEffect(() => {
    isInitialLoadRef.current = true;
    isPaginationLoadRef.current = false;
  }, [conversation._id]);

  const checkIfNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= BOTTOM_THRESHOLD_PX;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
    setHasNewMessagesBelow(false);
  }, []);

  // Handle scroll position & smart scrolling after DOM mutation
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || isLoading) return;

    const currentCount = messages.length;
    const prevCount = prevMessagesCountRef.current;

    if (isInitialLoadRef.current && currentCount > 0) {
      // 1. Initial Load: Immediate scroll to bottom
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
    } else if (isPaginationLoadRef.current && container.scrollHeight > prevScrollHeightRef.current) {
      // 2. Pagination: Preserve relative scroll position
      const heightDifference = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop += heightDifference;
      isPaginationLoadRef.current = false;
    } else if (currentCount > prevCount && !isInitialLoadRef.current) {
      // 3. New message added to bottom
      const latestMessage = messages[messages.length - 1];
      const isOwnMessage = latestMessage?.sender === currentUserId;
      const nearBottom = checkIfNearBottom();

      if (isOwnMessage || nearBottom) {
        scrollToBottom(true);
      } else {
        // Deferred state update to prevent set-state-in-effect warning
        requestAnimationFrame(() => {
          setHasNewMessagesBelow(true);
        });
      }
    }

    prevScrollHeightRef.current = container.scrollHeight;
    prevMessagesCountRef.current = currentCount;
  }, [messages, isLoading, currentUserId, checkIfNearBottom, scrollToBottom]);

  // Combined scroll listener: triggers top pagination & handles unread indicator clearing
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // Clear new messages badge if user manually scrolls back near bottom
    if (checkIfNearBottom()) {
      setHasNewMessagesBelow(false);
    }

    // Top scroll detection for pagination
    if (container.scrollTop < 40 && !isLoading && !isLoadingOlder && hasMore && onLoadOlder) {
      prevScrollHeightRef.current = container.scrollHeight;
      isPaginationLoadRef.current = true;
      onLoadOlder();
    }
  };

  if (isLoading) {
    return <MessageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 ring-1 ring-red-500/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-200">Couldn&apos;t load messages</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try again</span>
          </button>
        )}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 ring-1 ring-slate-200 dark:ring-white/5">
          <MessageSquareDashed className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-300">No messages yet</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 max-w-xs">
          Start the conversation by sending a message.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-6 space-y-2"
      >
        {/* Top Pagination Control / Loading Indicator */}
        {hasMore && (
          <div className="flex justify-center py-2">
            {isLoadingOlder ? (
              <div className="flex items-center gap-2 rounded-full bg-white dark:bg-slate-900/80 px-3 py-1 text-xs text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-white/5 shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500 dark:text-indigo-400" />
                <span>Loading older messages...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (containerRef.current) {
                    prevScrollHeightRef.current = containerRef.current.scrollHeight;
                    isPaginationLoadRef.current = true;
                  }
                  onLoadOlder?.();
                }}
                className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-900/80 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 ring-1 ring-indigo-500/30 transition shadow-sm"
              >
                <ArrowUpCircle className="h-3.5 w-3.5" />
                <span>Load older messages</span>
              </button>
            )}
          </div>
        )}

        {/* Message Items */}
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            currentUserId={currentUserId}
            isGroup={isGroup}
            senderUser={isGroup ? participantMap.get(message.sender) : undefined}
          />
        ))}
      </div>

      {/* Floating "New messages" Indicator Button */}
      {hasNewMessagesBelow && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xl hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition animate-bounce ring-1 ring-white/20"
            aria-label="Scroll to new messages"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span>New messages</span>
          </button>
        </div>
      )}
    </div>
  );
};
