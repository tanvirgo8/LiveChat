'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Smile, Search, X, Sticker } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker?: (stickerText: string) => void;
  isDisabled?: boolean;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  tag: string;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'popular',
    name: 'Top Reactions',
    icon: '🔥',
    emojis: [
      '😂', '❤️', '👍', '🔥', '😍', '😭', '🙏', '✨', '🎉', '💯', 
      '🥳', '😎', '🥰', '🥺', '💩', '🤡', '👏', '🙌', '🤝', '💡'
    ],
  },
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😊', '😇', '🙂', 
      '🙃', '😉', '😌', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', 
      '🤪', '🤨', '🧐', '🤓', '🥳', '🤯', '😬', '😷', '🤒', '😴', 
      '🤮', '😈', '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '🙈'
    ],
  },
  {
    id: 'gestures',
    name: 'Hands & People',
    icon: '👍',
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', 
      '🤝', '🙏', '✍️', '💅', '🤳', '💪', '👈', '👉', '👆', '👇', 
      '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '🖕', '👀', '🧠'
    ],
  },
  {
    id: 'hearts',
    name: 'Hearts & Symbols',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', 
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⚡', '🌟', 
      '⭐', '✨', '💥', '💯', '🚩', '🎯', '🔔', '💬', '✅', '❌'
    ],
  },
  {
    id: 'fun',
    name: 'Food & Activities',
    icon: '🍕',
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🍳', '🥞', '🍦', '🍩', 
      '🎂', '☕', '🧃', '🍺', '🥂', '⚽', '🏀', '🏈', '⚾', '🎾', 
      '🎮', '🎧', '🎨', '🏆', '🥇', '🎬', '🚀', '🎁', '🎈', '🎉'
    ],
  },
];

const BUILT_IN_STICKERS: StickerItem[] = [
  { id: 'stk-1', name: 'Super Love', emoji: '💖', tag: 'Love' },
  { id: 'stk-2', name: 'Thumbs Up', emoji: '👍', tag: 'Like' },
  { id: 'stk-3', name: 'On Fire', emoji: '🔥', tag: 'Hot' },
  { id: 'stk-4', name: 'Party Time', emoji: '🎉', tag: 'Party' },
  { id: 'stk-5', name: 'Celebration', emoji: '🥳', tag: 'Celebrate' },
  { id: 'stk-6', name: 'Stay Cool', emoji: '😎', tag: 'Cool' },
  { id: 'stk-7', name: 'To The Moon', emoji: '🚀', tag: 'Rocket' },
  { id: 'stk-8', name: 'Sobbing', emoji: '😭', tag: 'Cry' },
  { id: 'stk-9', name: 'Perfect 100', emoji: '💯', tag: '100' },
  { id: 'stk-10', name: 'Thank You', emoji: '🙏', tag: 'Thanks' },
  { id: 'stk-11', name: 'Cute Cat', emoji: '🐱', tag: 'Cat' },
  { id: 'stk-12', name: 'Happy Dog', emoji: '🐶', tag: 'Dog' },
  { id: 'stk-13', name: 'Coffee Time', emoji: '☕', tag: 'Coffee' },
  { id: 'stk-14', name: 'Champion', emoji: '🏆', tag: 'Winner' },
  { id: 'stk-15', name: 'Pizza Time', emoji: '🍕', tag: 'Pizza' },
  { id: 'stk-16', name: 'Mind Blown', emoji: '💥', tag: 'Boom' },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelectEmoji,
  onSelectSticker,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'emojis' | 'stickers'>('emojis');
  const [activeTab, setActiveTab] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentCategory = EMOJI_CATEGORIES.find((cat) => cat.id === activeTab) || EMOJI_CATEGORIES[0];

  // Filter emojis if search query is entered
  const displayedEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap((cat) => cat.emojis).filter((emoji, index, self) => self.indexOf(emoji) === index)
    : currentCategory.emojis;

  // Filter stickers if search query is entered
  const displayedStickers = searchQuery.trim()
    ? BUILT_IN_STICKERS.filter(
        (stk) =>
          stk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stk.tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : BUILT_IN_STICKERS;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40"
        title="Emojis & Built-in Stickers"
        aria-label="Emojis & Built-in Stickers"
        aria-expanded={isOpen}
      >
        <Smile className="h-5 w-5" />
      </button>

      {/* Emoji & Sticker Picker Popover */}
      {isOpen && (
        <div className="absolute bottom-14 left-0 sm:left-0 z-50 flex w-72 sm:w-80 flex-col overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Main Mode Toggle: Emojis vs Stickers */}
          <div className="mb-2.5 flex items-center gap-1 rounded-2xl bg-slate-100 dark:bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setPickerMode('emojis')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
                pickerMode === 'emojis'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Smile className="h-4 w-4 text-amber-500" />
              <span>Emojis</span>
            </button>
            <button
              type="button"
              onClick={() => setPickerMode('stickers')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
                pickerMode === 'stickers'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sticker className="h-4 w-4 text-purple-500" />
              <span>Stickers</span>
            </button>
          </div>

          {/* Header & Search */}
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={pickerMode === 'emojis' ? 'Search emojis...' : 'Search stickers...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/80 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Close picker"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Emojis Mode Content */}
          {pickerMode === 'emojis' && (
            <>
              {/* Category Tabs (shown when not searching) */}
              {!searchQuery.trim() && (
                <div className="mb-2.5 flex items-center justify-around rounded-xl bg-slate-100/80 dark:bg-slate-950/60 p-1">
                  {EMOJI_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveTab(cat.id)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all ${
                        activeTab === cat.id
                          ? 'bg-white dark:bg-slate-800 shadow-sm scale-110'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      title={cat.name}
                      aria-label={cat.name}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Grid */}
              <div className="max-h-48 overflow-y-auto pr-1">
                <div className="grid grid-cols-7 gap-1">
                  {displayedEmojis.map((emoji, index) => (
                    <button
                      key={`${emoji}-${index}`}
                      type="button"
                      onClick={() => {
                        onSelectEmoji(emoji);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-lg hover:bg-indigo-500/10 hover:scale-125 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Built-in Stickers Mode Content */}
          {pickerMode === 'stickers' && (
            <div className="max-h-56 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                {displayedStickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    type="button"
                    onClick={() => {
                      if (onSelectSticker) {
                        onSelectSticker(`[Sticker: ${sticker.name} ${sticker.emoji}]`);
                      }
                      setIsOpen(false);
                    }}
                    className="group flex items-center gap-2.5 rounded-2xl border border-purple-500/20 dark:border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10 p-2.5 text-left hover:border-purple-500 hover:bg-purple-500/15 transition-all duration-150 hover:scale-105 active:scale-95"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-2xl shadow-md group-hover:scale-110 transition-transform">
                      {sticker.emoji}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">
                        {sticker.name}
                      </span>
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        {sticker.tag}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
