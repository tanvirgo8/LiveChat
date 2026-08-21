import React, { useEffect } from 'react';
import { User } from '@/types';
import { useUserSearch } from '@/hooks/useUserSearch';
import { getInitials } from '@/lib/utils';
import { Search, X, Loader2, Phone, AlertCircle, UserCheck } from 'lucide-react';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => Promise<void>;
  currentUserId?: string;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  currentUserId,
}) => {
  const { query, setQuery, results, isLoading, error } = useUserSearch(currentUserId);
  const [isSubmittingId, setIsSubmittingId] = React.useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUserClick = async (user: User) => {
    setIsSubmittingId(user._id);
    try {
      await onSelectUser(user);
      onClose();
    } catch {
      // Error handled by parent hook
    } finally {
      setIsSubmittingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-white/10 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30">
              <UserCheck className="h-5 w-5" />
            </div>
            <h2 id="search-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Start New Conversation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search users by name or phone number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl bg-slate-100 dark:bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search users by name or phone number"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl bg-red-500/10 p-3 ring-1 ring-red-500/30">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
            <span className="text-xs text-red-600 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-center text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs">Searching users...</span>
            </div>
          ) : query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-500">
              Type a user&apos;s name or phone number to find them.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No users found matching &quot;{query}&quot;.
            </div>
          ) : (
            results.map((user) => {
              const initials = getInitials(user.name);
              const isSubmitting = isSubmittingId === user._id;

              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleUserClick(user)}
                  disabled={Boolean(isSubmittingId)}
                  className="flex w-full items-center justify-between rounded-2xl p-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
                  aria-label={`Start chat with ${user.name}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                        {user.phone}
                      </span>
                    </div>
                  </div>

                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500 dark:text-indigo-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
