import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, X } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';

interface MessageInputProps {
  onSendMessage?: (text: string) => Promise<void>;
  isDisabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isDisabled = false,
}) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || isDisabled || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      if (onSendMessage) {
        await onSendMessage(trimmed);
      }
      // Clear input ONLY after successful server ACK response
      setText('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (error) setError(null);
  };

  const handleSelectSticker = async (stickerText: string) => {
    if (isDisabled || isSubmitting || !onSendMessage) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onSendMessage(stickerText);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to send sticker. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const [placeholderText] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      return 'Write a message... (Press Enter to send)';
    }
    return 'Write a message...';
  });

  const isSendDisabled = !text.trim() || isDisabled || isSubmitting;

  return (
    <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-3.5 sm:p-4 backdrop-blur-xl space-y-2 select-none transition-colors duration-200">
      {/* Send Error Non-blocking Banner */}
      {error && (
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-red-500/10 px-3.5 py-2 text-xs text-red-600 dark:text-red-300 ring-1 ring-red-500/20 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
            <span className="truncate">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-lg p-1 hover:bg-red-500/20 text-red-500 dark:text-red-400 transition"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-2.5">
        {/* Emoji & Sticker Picker Popover Trigger */}
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onSelectSticker={handleSelectSticker}
          isDisabled={isDisabled || isSubmitting}
        />

        {/* Input Textarea Container */}
        <div className="relative flex flex-1 items-center rounded-2xl bg-slate-100 dark:bg-slate-950/80 ring-1 ring-slate-200 dark:ring-slate-800 transition focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500/80 focus-within:shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)]">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isDisabled || isSubmitting}
            className="block w-full resize-none bg-transparent py-2.5 sm:py-3 pl-4 pr-4 text-base sm:text-sm leading-snug text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-50 max-h-32 min-h-[44px] box-border"
            aria-label="Write a message"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSendDisabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 transition-all duration-150 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Send message"
          title="Send message"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
};
