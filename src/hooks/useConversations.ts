import { useState, useEffect, useCallback } from 'react';
import { Conversation, GetConversationsResponse, StartConversationResponse, LastMessage } from '@/types';
import { apiClient, getErrorMessage } from '@/lib/api-client';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<GetConversationsResponse>('/conversations');
      const list = response.data?.data || [];
      setConversations(list);
      return list;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<GetConversationsResponse>('/conversations')
      .then((res) => {
        if (isMounted) {
          setConversations(res.data?.data || []);
          setError(null);
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
      // POST /conversations returns { _id, participants: string[], createdAt }
      const res = await apiClient.post<StartConversationResponse>('/conversations', {
        userId: targetUserId,
      });

      const newConvId = res.data._id;

      // Re-fetch conversation list to get full participant details object
      const updatedList = await fetchConversations();

      const found = updatedList.find((c) => c._id === newConvId);
      if (found) return found;

      // Fallback: search for direct conversation with targetUserId
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
      
      // Update local state immediately & refresh list
      setConversations((prev) => [newGroup, ...prev.filter((c) => c._id !== newGroup._id)]);
      return newGroup;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  /**
   * Updates local conversation lastMessage and moves conversation to top of list
   */
  const updateConversationLastMessage = useCallback(
    (conversationId: string, lastMessage: LastMessage) => {
      setConversations((prev) => {
        const targetIndex = prev.findIndex((c) => c._id === conversationId);
        if (targetIndex === -1) return prev;

        const targetConv = { ...prev[targetIndex] };
        targetConv.lastMessage = lastMessage;
        targetConv.updatedAt = lastMessage.createdAt || new Date().toISOString();

        // Move updated conversation to top of list
        const filtered = prev.filter((c) => c._id !== conversationId);
        return [targetConv, ...filtered];
      });
    },
    []
  );

  /**
   * Directly updates or adds a conversation received via conversation:updated socket event or group REST action
   */
  const updateOrAddConversation = useCallback((updatedConv: Conversation) => {
    if (!updatedConv || !updatedConv._id) return;

    setConversations((prev) => {
      const exists = prev.some((c) => c._id === updatedConv._id);
      if (exists) {
        return prev.map((c) => (c._id === updatedConv._id ? { ...c, ...updatedConv } : c));
      }
      return [updatedConv, ...prev];
    });
  }, []);

  /**
   * Removes a conversation locally (e.g. when current user leaves a group)
   */
  const removeConversation = useCallback((conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c._id !== conversationId));
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
