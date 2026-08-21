'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { ChatLayout } from '@/components/chat/ChatLayout';

function ChatPageContent() {
  const { user, logout } = useAuth();
  const {
    conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refreshConversations,
    createDirectConversation,
    createGroupConversation,
    updateConversationLastMessage,
    updateOrAddConversation,
    removeConversation,
  } = useConversations();

  return (
    <ChatLayout
      user={user}
      conversations={conversations}
      isLoadingConversations={isLoadingConversations}
      conversationsError={conversationsError}
      onRefreshConversations={refreshConversations}
      onCreateDirectConversation={createDirectConversation}
      onCreateGroupConversation={createGroupConversation}
      onUpdateConversationLastMessage={updateConversationLastMessage}
      onUpdateOrAddConversation={updateOrAddConversation}
      onRemoveConversation={removeConversation}
      onLogout={logout}
    />
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatPageContent />
    </AuthGuard>
  );
}
