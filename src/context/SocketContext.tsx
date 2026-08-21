'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createSocketClient, TypedSocket } from '@/lib/socket-client';

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface SocketContextType {
  socket: TypedSocket | null;
  status: SocketStatus;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<TypedSocket | null>(null);

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

  return (
    <SocketContext.Provider
      value={{
        socket,
        status,
        isConnected,
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
