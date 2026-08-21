// Domain models based strictly on verified live API responses

export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export type Participant = User;

export interface LastMessage {
  text?: string;
  sender?: string;
  createdAt?: string;
}

export interface DirectConversation {
  _id: string;
  type: "direct";
  lastMessage: LastMessage | Record<string, never>;
  updatedAt: string;
  participant: User;
  createdAt?: string;
}

export interface GroupConversation {
  _id: string;
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: User[];
  lastMessage: LastMessage | Record<string, never>;
  updatedAt: string;
  createdAt?: string;
}

export type Conversation = DirectConversation | GroupConversation;

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
}
