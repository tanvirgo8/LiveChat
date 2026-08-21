import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@/types';

export const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'https://frontend-task-chatapp.onrender.com';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocketClient(token: string): TypedSocket {
  return io(SOCKET_SERVER_URL, {
    auth: {
      token,
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
}
