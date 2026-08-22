'use client';

import React, { useState, useEffect } from 'react';
import { User, Conversation, Message, LastMessage, GroupConversation } from '@/types';
import { ChatSidebar } from './ChatSidebar';
import { ChatPanel } from './ChatPanel';
import { UserSearchModal } from '../search/UserSearchModal';
import { CreateGroupModal } from '../groups/CreateGroupModal';
import { GroupInfoDrawer } from '../groups/GroupInfoDrawer';
import { useMessages, normalizeMessage } from '@/hooks/useMessages';
import { SocketMessagePayload } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { useGroupManagement } from '@/hooks/useGroupManagement';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChatLayoutProps {
  user: User | null;
  conversations: Conversation[];
  isLoadingConversations?: boolean;
  conversationsError?: string | null;
  onRefreshConversations?: () => void;
  onCreateDirectConversation: (userId: string) => Promise<Conversation | null>;
  onCreateGroupConversation: (name: string, participantIds: string[]) => Promise<Conversation>;
  onUpdateConversationLastMessage?: (conversationId: string, lastMessage: LastMessage) => void;
  onUpdateOrAddConversation?: (conversation: Conversation) => void;
  onRemoveConversation?: (conversationId: string) => void;
  onLogout: () => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  user,
  conversations,
  isLoadingConversations = false,
  conversationsError = null,
  onRefreshConversations,
  onCreateDirectConversation,
  onCreateGroupConversation,
  onUpdateConversationLastMessage,
  onUpdateOrAddConversation,
  onRemoveConversation,
  onLogout,
}) => {
  // Initialize active conversation & mobile view state from localStorage if available
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('livechat_active_conv_id') || null;
    }
    return null;
  });

  // Mobile View Navigation State: 'list' (Sidebar) or 'chat' (Active Chat Panel)
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'chat'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('livechat_mobile_view');
      if (savedView === 'chat' || savedView === 'list') {
        return savedView;
      }
    }
    return 'list';
  });

  // Modals state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  // Group Management REST Hook
  const { renameGroup, addMembers, removeMember, promoteAdmin, leaveGroup } = useGroupManagement();

  // Socket Context
  const { socket, status: socketStatus } = useSocket();

  // Effective selected ID (falls back to first conversation if not manually set)
  const effectiveSelectedId = selectedId || (conversations.length > 0 ? conversations[0]._id : null);

  // Messages Hook
  const {
    messages,
    isLoading: isLoadingMessages,
    isLoadingOlder: isLoadingOlderMessages,
    hasMore: hasMoreMessages,
    error: messagesError,
    fetchMessages,
    loadOlderMessages,
    sendMessage,
    addIncomingMessage,
    retry: retryMessages,
  } = useMessages();

  // Fetch real messages whenever selected conversation changes
  useEffect(() => {
    if (effectiveSelectedId) {
      fetchMessages(effectiveSelectedId);
    }
  }, [effectiveSelectedId, fetchMessages]);

  // Register Real-time Socket.IO Event Listeners with clean unmount handlers
  useEffect(() => {
    if (!socket) return;

    // 1. Handle incoming real-time message:new event
    const handleNewMessage = (rawMsgPayload: Message | SocketMessagePayload) => {
      if (!rawMsgPayload) return;

      const normalized = normalizeMessage(rawMsgPayload);
      if (!normalized._id || !normalized.conversation) return;

      // Update sidebar conversation preview & timestamp locally
      if (onUpdateConversationLastMessage) {
        onUpdateConversationLastMessage(normalized.conversation, {
          text: normalized.text,
          sender: normalized.sender,
          createdAt: normalized.createdAt,
        });
      }

      // Safely append to active thread (deduplicates against REST ACK response)
      addIncomingMessage(normalized);
    };

    // 2. Handle group/conversation structural updates
    const handleConversationUpdated = (updatedConv: Conversation) => {
      if (!updatedConv || !updatedConv._id) return;
      if (onUpdateOrAddConversation) {
        onUpdateOrAddConversation(updatedConv);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:updated', handleConversationUpdated);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdated);
    };
  }, [socket, addIncomingMessage, onUpdateConversationLastMessage, onUpdateOrAddConversation]);

  const selectedConversation = conversations.find((c) => c._id === effectiveSelectedId) || null;
  const currentUserId = user?._id || '';

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setActiveMobileView('chat');
    if (typeof window !== 'undefined') {
      localStorage.setItem('livechat_active_conv_id', id);
      localStorage.setItem('livechat_mobile_view', 'chat');
    }
  };

  const handleBackMobile = () => {
    setActiveMobileView('list');
    if (typeof window !== 'undefined') {
      localStorage.setItem('livechat_mobile_view', 'list');
    }
  };

  // Start 1-to-1 chat handler from UserSearchModal
  const handleSelectUserFromSearch = async (targetUser: User) => {
    const createdOrFound = await onCreateDirectConversation(targetUser._id);
    if (createdOrFound) {
      setSelectedId(createdOrFound._id);
      setActiveMobileView('chat');
      if (typeof window !== 'undefined') {
        localStorage.setItem('livechat_active_conv_id', createdOrFound._id);
        localStorage.setItem('livechat_mobile_view', 'chat');
      }
    }
  };

  // Create group chat handler from CreateGroupModal
  const handleCreateGroup = async (name: string, participantIds: string[]) => {
    const newGroup = await onCreateGroupConversation(name, participantIds);
    if (newGroup) {
      setSelectedId(newGroup._id);
      setActiveMobileView('chat');
      if (typeof window !== 'undefined') {
        localStorage.setItem('livechat_active_conv_id', newGroup._id);
        localStorage.setItem('livechat_mobile_view', 'chat');
      }
    }
  };

  // Group Management Handlers
  const handleRenameGroup = async (groupId: string, newName: string): Promise<GroupConversation> => {
    const updated = await renameGroup(groupId, newName);
    if (onUpdateOrAddConversation) {
      onUpdateOrAddConversation(updated);
    }
    return updated;
  };

  const handleAddMembers = async (groupId: string, userIds: string[]): Promise<GroupConversation> => {
    const updated = await addMembers(groupId, userIds);
    if (onUpdateOrAddConversation) {
      onUpdateOrAddConversation(updated);
    }
    return updated;
  };

  const handleRemoveMember = async (groupId: string, userId: string): Promise<GroupConversation> => {
    const updated = await removeMember(groupId, userId);
    if (onUpdateOrAddConversation) {
      onUpdateOrAddConversation(updated);
    }
    return updated;
  };

  const handlePromoteAdmin = async (groupId: string, userId: string): Promise<GroupConversation> => {
    const updated = await promoteAdmin(groupId, userId);
    if (onUpdateOrAddConversation) {
      onUpdateOrAddConversation(updated);
    }
    return updated;
  };

  const handleLeaveGroup = async (groupId: string, userId: string) => {
    await leaveGroup(groupId, userId);
    if (onRemoveConversation) {
      onRemoveConversation(groupId);
    }
    if (selectedId === groupId) {
      setSelectedId(null);
      setActiveMobileView('list');
    }
  };

  // Real REST API Message Send Handler
  const handleSendMessage = async (text: string) => {
    if (!effectiveSelectedId) return;

    const serverMsg = await sendMessage(text);

    // Update conversation sidebar lastMessage preview locally
    if (onUpdateConversationLastMessage && serverMsg) {
      onUpdateConversationLastMessage(effectiveSelectedId, {
        text: serverMsg.text,
        sender: serverMsg.sender,
        createdAt: serverMsg.createdAt,
      });
    }
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Panel (Desktop: w-80/w-96, Mobile: full width if activeMobileView === 'list') */}
      <div
        className={`h-full max-h-full shrink-0 ${
          activeMobileView === 'list' ? 'flex w-full' : 'hidden'
        } lg:flex lg:w-80 xl:w-96 flex-col overflow-hidden`}
      >
        {/* Error Alert Bar if conversation fetching failed */}
        {conversationsError && (
          <div className="shrink-0 flex items-center justify-between bg-red-500/10 px-4 py-2 ring-1 ring-red-500/20 text-xs text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span className="truncate">{conversationsError}</span>
            </div>
            {onRefreshConversations && (
              <button
                type="button"
                onClick={onRefreshConversations}
                className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 font-semibold text-red-200 hover:bg-red-500/30"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        )}

        <ChatSidebar
          user={user}
          conversations={conversations}
          selectedId={effectiveSelectedId}
          onSelectConversation={handleSelectConversation}
          onLogout={onLogout}
          isLoading={isLoadingConversations}
          onOpenNewChatModal={() => setIsNewChatOpen(true)}
          onOpenGroupModal={() => setIsGroupModalOpen(true)}
          socketStatus={socketStatus}
        />
      </div>

      {/* Main Active Chat Panel (Desktop: flex-1, Mobile: full width if activeMobileView === 'chat') */}
      <div
        className={`h-full max-h-full flex-1 min-w-0 ${
          activeMobileView === 'chat' ? 'flex w-full' : 'hidden'
        } lg:flex flex-col overflow-hidden`}
      >
        <ChatPanel
          conversation={selectedConversation}
          messages={messages}
          currentUserId={currentUserId}
          isLoadingConversations={isLoadingConversations}
          isLoadingMessages={isLoadingMessages}
          isLoadingOlderMessages={isLoadingOlderMessages}
          hasMoreMessages={hasMoreMessages}
          messagesError={messagesError}
          onRetryMessages={retryMessages}
          onLoadOlderMessages={loadOlderMessages}
          onBackMobile={handleBackMobile}
          onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Modals & Drawers */}
      <UserSearchModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleSelectUserFromSearch}
        currentUserId={currentUserId}
      />

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        currentUserId={currentUserId}
      />

      {selectedConversation && selectedConversation.type === 'group' && (
        <GroupInfoDrawer
          key={selectedConversation._id}
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          groupConversation={selectedConversation}
          currentUserId={currentUserId}
          onRenameGroup={handleRenameGroup}
          onAddMembers={handleAddMembers}
          onRemoveMember={handleRemoveMember}
          onPromoteAdmin={handlePromoteAdmin}
          onLeaveGroup={handleLeaveGroup}
        />
      )}
    </div>
  );
};
