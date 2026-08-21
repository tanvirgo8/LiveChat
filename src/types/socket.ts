// Socket.IO real-time event types matching verified live server responses

import { Conversation, Message } from './chat';

export interface SocketAuth {
  token: string;
}

export interface MessageSendPayload {
  conversationId: string;
  text: string;
}

/**
 * Socket.IO message payload emitted by server for message:new
 * Note: Uses `id` (instead of `_id`) and epoch timestamp number for `createdAt`.
 */
export interface SocketMessagePayload {
  id?: string;
  _id?: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: number | string;
}

export type MessageNewPayload = SocketMessagePayload | Message;

export type ConversationUpdatedPayload = Conversation;

export interface ClientToServerEvents {
  'message:send': (payload: MessageSendPayload, callback?: (ack: unknown) => void) => void;
}

export interface ServerToClientEvents {
  'message:new': (payload: MessageNewPayload) => void;
  'conversation:updated': (payload: ConversationUpdatedPayload) => void;
}
