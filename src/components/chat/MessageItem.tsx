import React from 'react';
import { Message, User } from '@/types';
import { formatTime } from '@/lib/utils';
import { Sticker } from 'lucide-react';

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

  // Check if message is a built-in Sticker [Sticker: Name Emoji]
  const isSticker = message.text.startsWith('[Sticker:') && message.text.endsWith(']');
  let stickerContent = { name: '', emoji: '' };

  if (isSticker) {
    const rawInner = message.text.slice(9, -1).trim();
    const parts = rawInner.split(' ');
    const emoji = parts.pop() || '';
    const name = parts.join(' ');
    stickerContent = { name, emoji };
  }

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

      {/* Render Sticker Message Card */}
      {isSticker ? (
        <div className="flex flex-col items-center">
          <div className="group relative flex flex-col items-center gap-1 rounded-3xl border border-purple-500/30 bg-gradient-to-tr from-purple-500/10 via-indigo-500/10 to-pink-500/10 p-3.5 shadow-xl backdrop-blur-md hover:scale-105 transition-all duration-200">
            <span className="text-5xl sm:text-6xl animate-bounce [animation-duration:3s]">
              {stickerContent.emoji}
            </span>
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/30 shadow-sm">
              <Sticker className="h-3 w-3 text-purple-500" />
              <span>{stickerContent.name}</span>
            </div>
            <span className="mt-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
              {timestamp}
            </span>
          </div>
        </div>
      ) : (
        /* Regular Message Bubble Container */
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
      )}
    </div>
  );
};
