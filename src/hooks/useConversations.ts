import { useState, useEffect, useCallback } from 'react';
import { Conversation, GetConversationsResponse, StartConversationResponse, LastMessage } from '@/types';
import { apiClient, getErrorMessage } from '@/lib/api-client';

const CONVERSATIONS_CACHE_KEY = 'livechat_cached_conversations';

export function useConversations() {
  // Initialize from cache if available for instant 0ms startup
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CONVERSATIONS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch {
        // Fallback to empty list
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CONVERSATIONS_CACHE_KEY);
      if (cached) return false;
    }
    return true;
  });

  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    setError(null);
    try {
      const response = await apiClient.get<GetConversationsResponse>('/conversations');
      const list = response.data?.data || [];
      setConversations(list);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(list));
      }
      return list;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Background revalidation on startup
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<GetConversationsResponse>('/conversations')
      .then((res) => {
        if (isMounted) {
          const list = res.data?.data || [];
          setConversations(list);
          setError(null);
          if (typeof window !== 'undefined') {
            localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(list));
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createDirectConversation = async (targetUserId: string): Promise<Conversation | null> => {
    setError(null);
    try {
      const res = await apiClient.post<StartConversationResponse>('/conversations', {
        userId: targetUserId,
      });

      const newConvId = res.data._id;
      const updatedList = await fetchConversations();

      const found = updatedList.find((c) => c._id === newConvId);
      if (found) return found;

      const foundByParticipant = updatedList.find(
        (c) => c.type === 'direct' && c.participant._id === targetUserId
      );
      return foundByParticipant || null;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const createGroupConversation = async (
    name: string,
    participantIds: string[]
  ): Promise<Conversation> => {
    setError(null);
    try {
      const response = await apiClient.post<Conversation>('/conversations/group', {
        name,
        participantIds,
      });

      const newGroup = response.data;
      setConversations((prev) => {
        const next = [newGroup, ...prev.filter((c) => c._id !== newGroup._id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(next));
        }
        return next;
      });
      return newGroup;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateConversationLastMessage = useCallback(
    (conversationId: string, lastMessage: LastMessage) => {
      setConversations((prev) => {
        const targetIndex = prev.findIndex((c) => c._id === conversationId);
        if (targetIndex === -1) return prev;

        const targetConv = { ...prev[targetIndex] };
        targetConv.lastMessage = lastMessage;
        targetConv.updatedAt = lastMessage.createdAt || new Date().toISOString();

        const filtered = prev.filter((c) => c._id !== conversationId);
        const next = [targetConv, ...filtered];

        if (typeof window !== 'undefined') {
          localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    []
  );

  const updateOrAddConversation = useCallback((updatedConv: Conversation) => {
    if (!updatedConv || !updatedConv._id) return;

    setConversations((prev) => {
      const exists = prev.some((c) => c._id === updatedConv._id);
      let next: Conversation[];
      if (exists) {
        next = prev.map((c) => (c._id === updatedConv._id ? { ...c, ...updatedConv } : c));
      } else {
        next = [updatedConv, ...prev];
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const removeConversation = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c._id !== conversationId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CONVERSATIONS_CACHE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return {
    conversations,
    isLoading,
    error,
    refreshConversations: fetchConversations,
    createDirectConversation,
    createGroupConversation,
    updateConversationLastMessage,
    updateOrAddConversation,
    removeConversation,
  };
}
