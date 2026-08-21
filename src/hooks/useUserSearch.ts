import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { apiClient, getErrorMessage } from '@/lib/api-client';

export function useUserSearch(currentUserId?: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<User[]>(`/users/search?q=${encodeURIComponent(trimmed)}`);
      // Filter out the current user if present
      const filtered = (response.data || []).filter(
        (u) => u._id !== currentUserId
      );
      setResults(filtered);
    } catch (err) {
      setError(getErrorMessage(err));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchUsers,
  };
}
