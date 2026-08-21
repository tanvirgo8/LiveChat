import { Conversation, Message, User } from '@/types';

export const MOCK_CURRENT_USER: User = {
  _id: '6a882468e5d6aac97521e25e',
  name: 'Ada Lovelace',
  phone: '+15551234567',
  createdAt: '2026-08-21T10:11:52.529Z',
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    _id: 'conv_1',
    type: 'direct',
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    lastMessage: {
      text: 'Have you checked the latest algorithm proposal for LiveChat?',
      sender: '6a882f6de5d6aac97521e902',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    participant: {
      _id: '6a882f6de5d6aac97521e902',
      name: 'Alan Turing',
      phone: '+15559876543',
      createdAt: '2026-08-21T10:58:53.614Z',
    },
  },
  {
    _id: 'conv_2',
    type: 'group',
    name: 'CS Pioneers Team',
    createdBy: '6a882468e5d6aac97521e25e',
    admins: ['6a882468e5d6aac97521e25e', '6a882f6de5d6aac97521e902'],
    participants: [
      { _id: '6a882468e5d6aac97521e25e', name: 'Ada Lovelace', phone: '+15551234567' },
      { _id: '6a882f6de5d6aac97521e902', name: 'Alan Turing', phone: '+15559876543' },
      { _id: '6a882f6ee5d6aac97521e905', name: 'Grace Hopper', phone: '+15555555555' },
    ],
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    lastMessage: {
      text: 'Grace Hopper joined the group conversation.',
      sender: '6a882f6ee5d6aac97521e905',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    _id: 'conv_3',
    type: 'direct',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    lastMessage: {
      text: 'Let us schedule the architectural review tomorrow.',
      sender: '6a882468e5d6aac97521e25e',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    participant: {
      _id: '6a882f6ee5d6aac97521e905',
      name: 'Grace Hopper',
      phone: '+15555555555',
      createdAt: '2026-08-21T10:58:54.312Z',
    },
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  conv_1: [
    {
      _id: 'm1',
      conversation: 'conv_1',
      sender: '6a882f6de5d6aac97521e902', // Alan Turing
      text: 'Hello Ada! Hope you are doing well.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      _id: 'm2',
      conversation: 'conv_1',
      sender: '6a882468e5d6aac97521e25e', // Ada Lovelace (current user)
      text: 'Hi Alan! Everything is running smoothly with the new architecture.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      _id: 'm3',
      conversation: 'conv_1',
      sender: '6a882f6de5d6aac97521e902',
      text: 'Have you checked the latest algorithm proposal for LiveChat?',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  conv_2: [
    {
      _id: 'm4',
      conversation: 'conv_2',
      sender: '6a882468e5d6aac97521e25e',
      text: 'Welcome to the CS Pioneers group team!',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      _id: 'm5',
      conversation: 'conv_2',
      sender: '6a882f6de5d6aac97521e902',
      text: 'Great to be here! Looking forward to building real-time messaging.',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      _id: 'm6',
      conversation: 'conv_2',
      sender: '6a882f6ee5d6aac97521e905',
      text: 'Grace Hopper joined the group conversation.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
  conv_3: [
    {
      _id: 'm7',
      conversation: 'conv_3',
      sender: '6a882f6ee5d6aac97521e905',
      text: 'Hi Ada, do you have a moment to discuss compiler optimizations?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      _id: 'm8',
      conversation: 'conv_3',
      sender: '6a882468e5d6aac97521e25e',
      text: 'Let us schedule the architectural review tomorrow.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ],
};
