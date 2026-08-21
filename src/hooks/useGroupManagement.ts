import { useState, useCallback } from 'react';
import { GroupConversation } from '@/types';
import { apiClient, getErrorMessage } from '@/lib/api-client';

export function useGroupManagement() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addMembers = useCallback(async (groupId: string, userIds: string[]): Promise<GroupConversation> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<GroupConversation>(`/conversations/${groupId}/participants`, {
        userIds,
      });
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (groupId: string, userId: string): Promise<GroupConversation> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete<GroupConversation>(`/conversations/${groupId}/participants/${userId}`);
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveGroup = useCallback(async (groupId: string, currentUserId: string): Promise<GroupConversation | { ok: boolean }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete<GroupConversation | { ok: boolean }>(`/conversations/${groupId}/participants/${currentUserId}`);
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const promoteAdmin = useCallback(async (groupId: string, userId: string): Promise<GroupConversation> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<GroupConversation>(`/conversations/${groupId}/admins`, {
        userId,
      });
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renameGroup = useCallback(async (groupId: string, name: string): Promise<GroupConversation> => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Group name cannot be empty.');
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<GroupConversation>(`/conversations/${groupId}`, {
        name: trimmed,
      });
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    addMembers,
    removeMember,
    leaveGroup,
    promoteAdmin,
    renameGroup,
  };
}
