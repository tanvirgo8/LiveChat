'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginResponse, LoginRequest } from '@/types';
import { apiClient, TOKEN_STORAGE_KEY, getErrorMessage } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, name: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const clearError = useCallback(() => setError(null), []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    setToken(null);
    setUser(null);
    setError(null);
    router.push('/login');
  }, [router]);

  // Session restoration on app startup
  useEffect(() => {
    const restoreSession = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const response = await apiClient.get<User>('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.warn('Session restoration failed:', getErrorMessage(err));
        // Clear invalid or expired token
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (phone: string, name: string) => {
    setError(null);

    try {
      const payload: LoginRequest = { phone, name };
      const response = await apiClient.post<LoginResponse>('/auth/login', payload);

      const { token: newToken, user: loggedInUser } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      }

      setToken(newToken);
      setUser(loggedInUser);
      router.replace('/chat');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    }
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
