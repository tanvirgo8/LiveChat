import { useState, useCallback, useRef } from 'react';
import { Message, GetMessagesResponse, SendMessageRequest, SocketMessagePayload } from '@/types';
import { apiClient, getErrorMessage } from '@/lib/api-client';

const MESSAGES_LIMIT = 20;

/**
 * Normalizes REST or Socket.IO message payloads into a unified Message entity.
 * Handles `_id` vs `id` and ISO string vs numeric epoch timestamp.
 */
export function normalizeMessage(raw: Message | SocketMessagePayload): Message {
  const messageId = raw._id || (raw as SocketMessagePayload).id || '';
  const rawCreatedAt = raw.createdAt;
  
  let createdAtIso: string;
  if (typeof rawCreatedAt === 'number') {
    createdAtIso = new Date(rawCreatedAt).toISOString();
  } else if (typeof rawCreatedAt === 'string' && rawCreatedAt) {
    createdAtIso = rawCreatedAt;
  } else {
    createdAtIso = new Date().toISOString();
  }

  return {
    _id: messageId,
    conversation: raw.conversation,
    sender: raw.sender,
    text: raw.text,
    createdAt: createdAtIso,
  };
}

/**
 * Deduplicates messages by `_id` and sorts them chronologically (oldest first -> newest last)
 */
export function deduplicateAndSortMessages(messages: (Message | SocketMessagePayload)[]): Message[] {
  const map = new Map<string, Message>();
  for (const raw of messages) {
    if (!raw) continue;
    const normalized = normalizeMessage(raw);
    if (normalized._id) {
      map.set(normalized._id, normalized);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sendMessageError, setSendMessageError] = useState<string | null>(null);

  // Track currently active conversation ID to prevent stale fast-switching overwrites
  const activeConversationIdRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      setHasMore(false);
      setError(null);
      setSendMessageError(null);
      return;
    }

    // Set current active target
    activeConversationIdRef.current = conversationId;

    // Immediately clear previous conversation messages to prevent flashing old data
    setMessages([]);
    setIsLoading(true);
    setError(null);
    setSendMessageError(null);
    setHasMore(false);

    try {
      const response = await apiClient.get<GetMessagesResponse>(
        `/conversations/${conversationId}/messages?limit=${MESSAGES_LIMIT}`
      );

      // Check if user switched to another conversation while waiting for this request
      if (activeConversationIdRef.current !== conversationId) {
        return;
      }

      const fetchedMessages = response.data?.messages || [];
      const more = Boolean(response.data?.hasMore);

      const sorted = deduplicateAndSortMessages(fetchedMessages);
      setMessages(sorted);
      setHasMore(more);
    } catch (err) {
      if (activeConversationIdRef.current === conversationId) {
        const msg = getErrorMessage(err);
        setError(msg);
      }
    } finally {
      if (activeConversationIdRef.current === conversationId) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadOlderMessages = useCallback(async () => {
    const activeId = activeConversationIdRef.current;
    if (!activeId || isLoadingOlder || !hasMore || messages.length === 0) {
      return;
    }

    // Oldest message is at index 0 (sorted chronologically)
    const oldestMessageId = messages[0]._id;
    setIsLoadingOlder(true);

    try {
      const response = await apiClient.get<GetMessagesResponse>(
        `/conversations/${activeId}/messages?limit=${MESSAGES_LIMIT}&before=${oldestMessageId}`
      );

      if (activeConversationIdRef.current !== activeId) {
        return;
      }

      const olderMessages = response.data?.messages || [];
      const more = Boolean(response.data?.hasMore);

      if (olderMessages.length > 0) {
        setMessages((prev) => deduplicateAndSortMessages([...olderMessages, ...prev]));
      }
      setHasMore(more);
    } catch (err) {
      console.warn('Failed to load older messages:', getErrorMessage(err));
    } finally {
      if (activeConversationIdRef.current === activeId) {
        setIsLoadingOlder(false);
      }
    }
  }, [hasMore, isLoadingOlder, messages]);

  const sendMessage = useCallback(async (text: string): Promise<Message> => {
    const activeId = activeConversationIdRef.current;
    if (!activeId) {
      throw new Error('No active conversation selected.');
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('Message text cannot be empty.');
    }

    setIsSending(true);
    setSendMessageError(null);

    try {
      const payload: SendMessageRequest = {
        conversationId: activeId,
        text: trimmedText,
      };

      const response = await apiClient.post<Message>('/messages', payload);
      const serverMsg = response.data;
      const normalizedServerMsg = normalizeMessage(serverMsg);

      // Verify conversation target is still active before local state insertion
      if (activeConversationIdRef.current === activeId) {
        setMessages((prev) => deduplicateAndSortMessages([...prev, normalizedServerMsg]));
      }

      return normalizedServerMsg;
    } catch (err) {
      const msg = getErrorMessage(err);
      setSendMessageError(msg);
      throw new Error(msg);
    } finally {
      setIsSending(false);
    }
  }, []);

  /**
   * Safely inserts an incoming real-time socket message into state if it belongs to the active conversation
   */
  const addIncomingMessage = useCallback((incomingMessage: Message | SocketMessagePayload) => {
    if (!incomingMessage || (!incomingMessage._id && !(incomingMessage as SocketMessagePayload).id) || !incomingMessage.conversation) {
      return;
    }

    const normalized = normalizeMessage(incomingMessage);
    const activeId = activeConversationIdRef.current;

    if (activeId && normalized.conversation === activeId) {
      setMessages((prev) => deduplicateAndSortMessages([...prev, normalized]));
    }
  }, []);

  const retry = useCallback(() => {
    if (activeConversationIdRef.current) {
      fetchMessages(activeConversationIdRef.current);
    }
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    isLoadingOlder,
    isSending,
    hasMore,
    error,
    sendMessageError,
    fetchMessages,
    loadOlderMessages,
    sendMessage,
    addIncomingMessage,
    retry,
  };
}
