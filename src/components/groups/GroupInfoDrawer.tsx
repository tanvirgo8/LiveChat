import React, { useState, useEffect } from 'react';
import { GroupConversation, User } from '@/types';
import { getInitials } from '@/lib/utils';
import { AddMembersModal } from './AddMembersModal';
import {
  X,
  Users,
  ShieldCheck,
  UserPlus,
  Crown,
  Edit2,
  Trash2,
  LogOut,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groupConversation: GroupConversation;
  currentUserId: string;
  onRenameGroup: (groupId: string, newName: string) => Promise<GroupConversation>;
  onAddMembers: (groupId: string, userIds: string[]) => Promise<GroupConversation>;
  onRemoveMember: (groupId: string, userId: string) => Promise<GroupConversation>;
  onPromoteAdmin: (groupId: string, userId: string) => Promise<GroupConversation>;
  onLeaveGroup: (groupId: string, currentUserId: string) => Promise<void>;
}

export const GroupInfoDrawer: React.FC<GroupInfoDrawerProps> = ({
  isOpen,
  onClose,
  groupConversation,
  currentUserId,
  onRenameGroup,
  onAddMembers,
  onRemoveMember,
  onPromoteAdmin,
  onLeaveGroup,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(groupConversation.name);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  // Loading & error states per action
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Destructive confirmation modals
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);

  // Close drawer on Escape key
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

  const isAdmin = groupConversation.admins.includes(currentUserId);

  // Handle Rename Submit
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === groupConversation.name || actionLoadingId === 'rename') return;

    setError(null);
    setActionLoadingId('rename');

    try {
      await onRenameGroup(groupConversation._id, trimmed);
      setIsEditingName(false);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Promote to Admin
  const handlePromoteAdmin = async (targetUser: User) => {
    if (actionLoadingId) return;

    setError(null);
    setActionLoadingId(`promote_${targetUser._id}`);

    try {
      await onPromoteAdmin(groupConversation._id, targetUser._id);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async () => {
    if (!memberToRemove || actionLoadingId) return;

    setError(null);
    setActionLoadingId(`remove_${memberToRemove._id}`);

    try {
      await onRemoveMember(groupConversation._id, memberToRemove._id);
      setMemberToRemove(null);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Leave Group
  const handleLeaveGroup = async () => {
    if (actionLoadingId) return;

    setError(null);
    setActionLoadingId('leave');

    try {
      await onLeaveGroup(groupConversation._id, currentUserId);
      setIsConfirmLeaveOpen(false);
      onClose();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-drawer-title"
        onClick={onClose}
        className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      >
        <div
          className="flex h-full w-full max-w-md flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl select-none transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2.5">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 id="group-drawer-title" className="text-base font-bold text-slate-900 dark:text-white">
                Group Details
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close group details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Group Profile Header */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-200 ring-1 ring-indigo-500/40 text-2xl font-bold shadow-lg">
                <Users className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Group Name Display or Rename Form */}
              {isEditingName && isAdmin ? (
                <form onSubmit={handleRenameSubmit} className="mt-4 flex items-center gap-2 w-full max-w-xs">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter new group name..."
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-950 px-3 py-2 text-base sm:text-sm text-slate-900 dark:text-white border border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={actionLoadingId === 'rename' || !nameInput.trim()}
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shrink-0 disabled:opacity-50"
                  >
                    {actionLoadingId === 'rename' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(groupConversation.name);
                    }}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{groupConversation.name}</h3>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(groupConversation.name);
                          setIsEditingName(true);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/20 px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/20 transition"
                        title="Rename Group"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {!isAdmin && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700/60">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Only group admins can change the name</span>
                    </div>
                  )}
                </div>
              )}

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {groupConversation.participants.length} members
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300 ring-1 ring-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Admin Actions: Rename & Add Members */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(groupConversation.name);
                    setIsEditingName(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-white/10 transition hover:bg-indigo-600/10 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  <Edit2 className="h-4 w-4 text-indigo-500" />
                  <span>Rename Group</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddMembersOpen(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/20 py-2.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30 transition hover:bg-indigo-600/20 dark:hover:bg-indigo-600/30"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Members</span>
                </button>
              </div>
            )}

            {/* Participants Section */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Participants ({groupConversation.participants.length})
                </span>
              </div>

              <div className="mt-3 space-y-1">
                {groupConversation.participants.map((p) => {
                  const isUserAdmin = groupConversation.admins.includes(p._id);
                  const isUserCreator = p._id === groupConversation.createdBy;
                  const isSelf = p._id === currentUserId;

                  return (
                    <div
                      key={p._id}
                      className="flex items-center justify-between rounded-2xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30">
                          {getInitials(p.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                              {p.name} {isSelf && '(You)'}
                            </span>
                            {isUserCreator && (
                              <span title="Group Creator">
                                <Crown className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                              </span>
                            )}
                            {isUserAdmin && (
                              <span title="Admin">
                                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{p.phone}</span>
                        </div>
                      </div>

                      {/* Participant Actions (for admins managing other members) */}
                      {isAdmin && !isSelf && (
                        <div className="flex items-center gap-1">
                          {!isUserAdmin && (
                            <button
                              type="button"
                              onClick={() => handlePromoteAdmin(p)}
                              disabled={actionLoadingId === `promote_${p._id}`}
                              className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                              title="Make Admin"
                            >
                              {actionLoadingId === `promote_${p._id}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'Make Admin'
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setMemberToRemove(p)}
                            disabled={actionLoadingId === `remove_${p._id}`}
                            className="rounded-lg p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition"
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave Group Action */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setIsConfirmLeaveOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 ring-1 ring-red-500/20 transition hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Leave Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        groupConversation={groupConversation}
        onAddMembers={async (id, userIds) => {
          await onAddMembers(id, userIds);
        }}
        currentUserId={currentUserId}
      />

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setMemberToRemove(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            className="flex w-full max-w-sm flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Remove Member?</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to remove <span className="font-bold text-slate-900 dark:text-slate-200">{memberToRemove.name}</span> from this group?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveMember}
                disabled={Boolean(actionLoadingId)}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
              >
                {actionLoadingId === `remove_${memberToRemove._id}` ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Remove</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Confirmation Dialog */}
      {isConfirmLeaveOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsConfirmLeaveOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            className="flex w-full max-w-sm flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Leave Group?</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to leave <span className="font-bold text-slate-900 dark:text-slate-200">{groupConversation.name}</span>? You will no longer receive messages from this group.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmLeaveOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveGroup}
                disabled={actionLoadingId === 'leave'}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
              >
                {actionLoadingId === 'leave' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Leave</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
