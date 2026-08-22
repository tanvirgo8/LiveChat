import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useUserSearch } from '@/hooks/useUserSearch';
import { getInitials } from '@/lib/utils';
import { Users, X, Search, Loader2, AlertCircle, Plus, Check } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participantIds: string[]) => Promise<void>;
  currentUserId?: string;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  currentUserId,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { query, setQuery, results, isLoading: isSearchLoading } = useUserSearch(currentUserId);

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

  const handleToggleUser = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === user._id);
      if (exists) {
        return prev.filter((u) => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const handleRemoveSelected = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const trimmedName = groupName.trim();
    if (!trimmedName) {
      setValidationError('Please enter a group name.');
      return;
    }

    if (selectedUsers.length < 2) {
      setValidationError('Please select at least 2 other members to create a group.');
      return;
    }

    setIsSubmitting(true);

    try {
      const participantIds = selectedUsers.map((u) => u._id);
      await onCreateGroup(trimmedName, participantIds);
      // Reset form
      setGroupName('');
      setSelectedUsers([]);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Failed to create group.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-group-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-white/10 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30">
              <Users className="h-5 w-5" />
            </div>
            <h2 id="create-group-title" className="text-base font-bold text-slate-900 dark:text-white">
              Create New Group
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Alert */}
          {(validationError || apiError) && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 p-3 ring-1 ring-red-500/30">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
              <span className="text-xs text-red-600 dark:text-red-300">{validationError || apiError}</span>
            </div>
          )}

          {/* Group Name Input */}
          <div>
            <label htmlFor="groupName" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              required
              placeholder="e.g. Project Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isSubmitting}
              className="mt-1.5 block w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-950/80 py-2.5 px-4 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Selected Participants Pills */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                {selectedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-600/15 dark:bg-purple-600/20 py-1 pl-3 pr-1 text-xs font-medium text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/30"
                  >
                    <span>{user.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelected(user._id)}
                      className="rounded-full p-0.5 hover:bg-purple-500/30 hover:text-purple-900 dark:hover:text-white transition"
                      aria-label={`Remove ${user.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add Members Search Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Add Members
            </label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search users to add to group..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-slate-100 dark:bg-slate-950/80 py-2 pl-9 pr-3 text-base sm:text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* User Search Results Container */}
            <div className="mt-2 max-h-48 overflow-y-auto rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-1.5 ring-1 ring-slate-200 dark:ring-white/5 space-y-1">
              {isSearchLoading ? (
                <div className="flex items-center justify-center p-4 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400 mr-2" />
                  Searching users...
                </div>
              ) : query.trim() === '' ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Type a name or phone number to search for members.
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No users found matching &quot;{query}&quot;.
                </div>
              ) : (
                results.map((user) => {
                  const isSelected = selectedUsers.some((u) => u._id === user._id);
                  const initials = getInitials(user.name);

                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleToggleUser(user)}
                      className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left transition ${
                        isSelected
                          ? 'bg-purple-600/15 dark:bg-purple-600/20 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500/30'
                          : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-xs font-bold text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30">
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
                          <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">{user.phone}</span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-600 text-white shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                          <Plus className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || selectedUsers.length < 2 || !groupName.trim()}
              className="flex w-full items-center justify-center rounded-2xl bg-purple-600 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transition duration-150 hover:bg-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Group...
                </span>
              ) : (
                `Create Group (${selectedUsers.length + 1} members)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
