// REST API request and response payload types matching verified live server responses

import { Conversation, Message, User } from './chat';

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
  };
}

export interface LoginRequest {
  phone: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type AuthMeResponse = User;

export interface StartConversationRequest {
  userId: string;
}

export type StartConversationResponse = {
  _id: string;
  participants: string[];
  createdAt: string;
};

export type GetConversationsResponse = {
  data: Conversation[];
};

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

export type SendMessageResponse = Message;

export interface GetMessagesQuery {
  limit?: number;
  before?: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface CreateGroupRequest {
  name: string;
  participantIds: string[];
}

export type CreateGroupResponse = Conversation;

export interface AddParticipantsRequest {
  userIds: string[];
}

export interface PromoteRequest {
  userId: string;
}

export interface RenameGroupRequest {
  name: string;
}
