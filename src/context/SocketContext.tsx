'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createSocketClient, TypedSocket } from '@/lib/socket-client';

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export const TAB_ID = typeof window !== 'undefined' ? Math.random().toString(36).substring(2, 9) : 'server';

interface SocketContextType {
  socket: TypedSocket | null;
  status: SocketStatus;
  isConnected: boolean;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<TypedSocket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for cross-tab typing events
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastRef.current = new BroadcastChannel('livechat_typing');
    }
    return () => {
      if (broadcastRef.current) {
        broadcastRef.current.close();
        broadcastRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setStatus('disconnected');
        setIsConnected(false);
      }
      return;
    }

    if (!socketRef.current) {
      const client = createSocketClient(token);
      socketRef.current = client;
      setSocket(client);

      client.on('connect', () => {
        setStatus('connected');
        setIsConnected(true);
      });

      client.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          setStatus('error');
          client.connect();
        } else {
          setStatus('reconnecting');
        }
      });

      client.on('connect_error', () => {
        setStatus('error');
        setIsConnected(false);
      });

      client.io.on('reconnect_attempt', () => {
        setStatus('reconnecting');
      });

      client.io.on('reconnect', () => {
        setStatus('connected');
        setIsConnected(true);
      });

      client.connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [isAuthenticated, token]);

  const emitTypingPayload = useCallback((conversationId: string, isTyping: boolean) => {
    const payload = {
      conversationId: String(conversationId),
      userId: user?._id || 'anonymous',
      userName: user?.name || 'Someone',
      isTyping,
      tabId: TAB_ID,
      timestamp: Date.now(),
      nonce: Math.random(),
    };

    // 1. Socket.IO event emission
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit((isTyping ? 'typing:start' : 'typing:stop') as unknown as 'message:send', { conversationId } as unknown as { conversationId: string; text: string });
      socketRef.current.emit('typing:update' as unknown as 'message:send', payload as unknown as { conversationId: string; text: string });
    }

    // 2. BroadcastChannel emission (cross-tab in same browser)
    if (broadcastRef.current) {
      broadcastRef.current.postMessage(payload);
    }

    // 3. localStorage storage event emission (cross-window/cross-tab fallback)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('livechat_typing_event', JSON.stringify(payload));
      }
    } catch {
      // Ignore quota or privacy exceptions
    }
  }, [user]);

  const startTyping = useCallback((conversationId: string) => {
    emitTypingPayload(conversationId, true);
  }, [emitTypingPayload]);

  const stopTyping = useCallback((conversationId: string) => {
    emitTypingPayload(conversationId, false);
  }, [emitTypingPayload]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        status,
        isConnected,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
