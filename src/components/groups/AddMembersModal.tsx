import React, { useState, useEffect } from 'react';
import { User, GroupConversation } from '@/types';
import { useUserSearch } from '@/hooks/useUserSearch';
import { getInitials } from '@/lib/utils';
import { X, Search, UserPlus, Check, Loader2, AlertCircle } from 'lucide-react';

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupConversation: GroupConversation;
  onAddMembers: (groupId: string, userIds: string[]) => Promise<void>;
  currentUserId: string;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
  isOpen,
  onClose,
  groupConversation,
  onAddMembers,
  currentUserId,
}) => {
  const { query, setQuery, results, isLoading: isSearching, error: searchError } = useUserSearch();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Existing participant user IDs map
  const existingParticipantIds = new Set(
    groupConversation.participants.map((p) => p._id)
  );

  // Filter out existing participants & current user
  const availableResults = results.filter(
    (u) => u._id !== currentUserId && !existingParticipantIds.has(u._id)
  );

  const toggleSelectUser = (user: User) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0 || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const userIds = selectedUsers.map((u) => u._id);
      await onAddMembers(groupConversation._id, userIds);
      setSelectedUsers([]);
      setQuery('');
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add members. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-members-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="flex w-full max-w-md flex-col rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="add-members-title" className="text-base font-bold text-white">
                Add Members
              </h2>
              <p className="text-xs text-slate-400">{groupConversation.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedUsers.map((u) => (
              <span
                key={u._id}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-900/60 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-500/30"
              >
                <span>{u.name}</span>
                <button
                  type="button"
                  onClick={() => toggleSelectUser(u)}
                  className="rounded-full p-0.5 hover:bg-indigo-700/50"
                  aria-label={`Remove ${u.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users to add..."
            className="w-full rounded-2xl bg-slate-950 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300 ring-1 ring-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Results List */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-1">
          {isSearching ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Searching users...</span>
            </div>
          ) : searchError ? (
            <p className="py-6 text-center text-xs text-red-400">{searchError}</p>
          ) : availableResults.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              {query.trim() ? 'No new users found.' : 'Type a name or phone number to search.'}
            </p>
          ) : (
            availableResults.map((u) => {
              const isSelected = selectedUsers.some((selected) => selected._id === u._id);
              return (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => toggleSelectUser(u)}
                  className={`flex w-full items-center justify-between rounded-2xl p-3 text-left transition ${
                    isSelected ? 'bg-indigo-950/60 ring-1 ring-indigo-500/40' : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.phone}</p>
                    </div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-lg border ${
                      isSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Actions Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <span>Add Selected ({selectedUsers.length})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
