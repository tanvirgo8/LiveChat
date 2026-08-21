import React from 'react';
import { Message, User } from '@/types';
import { formatTime } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  isGroup?: boolean;
  senderUser?: User;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  isGroup = false,
  senderUser,
}) => {
  const isMine = message.sender === currentUserId;
  const timestamp = formatTime(message.createdAt);
  const senderName = senderUser?.name || 'User';

  return (
    <div
      className={`flex w-full flex-col ${
        isMine ? 'items-end' : 'items-start'
      } my-1.5 animate-in fade-in duration-150`}
    >
      {/* Sender Name in Group Chat */}
      {isGroup && !isMine && (
        <span className="mb-1 ml-1 text-[11px] font-bold text-purple-600 dark:text-purple-300">
          {senderName}
        </span>
      )}

      {/* Message Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md transition-all ${
          isMine
            ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white rounded-br-xs shadow-indigo-600/20'
            : 'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-white/10 rounded-bl-xs'
        }`}
      >
        <p className="break-words text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>

        {/* Timestamp */}
        <div
          className={`mt-1 flex items-center justify-end text-[10px] font-medium ${
            isMine ? 'text-indigo-100 dark:text-indigo-200/90' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
};
