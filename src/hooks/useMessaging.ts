import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  createConversation,
  type Conversation,
  type MessageHistory,
  type Message,
  type ConversationFilters,
  type ConversationPagination
} from '../lib/messaging';
import { apiRequest } from '@/lib/queryClient'; // FIXED: Import authenticated API client

export function useConversations(filters: ConversationFilters = {}, enabled: boolean = true) {
  // Create stable filtersKey using useMemo to prevent unnecessary re-renders
  const filtersKey = useMemo(() => filters, [JSON.stringify(filters)]);
  
  // DEBUG: Add detailed logging for useConversations hook
  console.log('🔍 useConversations DEBUG - Hook called with:', {
    filters: filtersKey,
    enabled,
    hasAuthToken: !!localStorage.getItem('authToken'),
    authToken: localStorage.getItem('authToken') ? '[PRESENT]' : '[MISSING]'
  });
  
  // Use React Query with specific configuration to prevent infinite loops
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['/api/messaging/conversations', filtersKey],
    queryFn: async () => {
      console.log('🔍 useConversations DEBUG - Query function called, about to call getConversations with:', filtersKey);
      try {
        const result = await getConversations(filtersKey);
        console.log('🔍 useConversations DEBUG - getConversations returned:', result);
        return result;
      } catch (error) {
        console.error('🔍 useConversations DEBUG - getConversations error:', error);
        throw error;
      }
    },
    enabled: enabled, // Gate query by authentication status
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  // DEBUG: Log the query result
  console.log('🔍 useConversations DEBUG - Query result:', {
    data,
    loading,
    queryError,
    conversations: data?.conversations,
    conversationsLength: data?.conversations?.length
  });

  // Transform error to match existing interface
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch conversations') : null;

  return {
    conversations: data?.conversations || [],
    pagination: data?.pagination || null,
    loading,
    error,
    refetch: () => refetch()
  };
}

export function useMessages(conversationId: string | null, enabled: boolean = true) {
  // Use React Query for messages
  const {
    data: messageHistory,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['/api/messaging/conversations', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: enabled && !!conversationId, // Gate by authentication AND conversationId
    staleTime: 15000, // 15 seconds for messages
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Transform error to match existing interface
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch messages') : null;

  return {
    messageHistory: messageHistory || null,
    loading,
    error,
    refetch: () => refetch()
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: {
      conversationId: string;
      content?: string;
      documentIds?: string[];
    }) => {
      const messageData: any = { conversation_id: data.conversationId };
      
      if (data.content) {
        messageData.content = data.content;
      }
      
      if (data.documentIds && data.documentIds.length > 0) {
        messageData.documentIds = data.documentIds;
      }
      
      return sendMessage(messageData);
    },
    onSuccess: (_, variables) => {
      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
      // Invalidate specific conversation messages
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messaging/conversations', variables.conversationId] 
      });
    }
  });

  const send = async (
    conversationId: string, 
    content?: string, 
    documentIds?: string[]
  ): Promise<Message | null> => {
    try {
      const message = await mutation.mutateAsync({ conversationId, content, documentIds });
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  };

  return {
    send,
    sending: mutation.isPending,
    error: mutation.error ? (mutation.error instanceof Error ? mutation.error.message : 'Failed to send message') : null
  };
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: { advocateId: string; studentId?: string; parentId: string }) => 
      createConversation({
        advocate_id: data.advocateId,
        student_id: data.studentId,
        parent_id: data.parentId
      }),
    onSuccess: () => {
      // Invalidate conversations list to show new conversation
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
    }
  });

  const create = async (advocateId: string, parentId: string, studentId?: string): Promise<Conversation | null> => {
    try {
      const conversation = await mutation.mutateAsync({ advocateId, studentId, parentId });
      return conversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  };

  return {
    create,
    creating: mutation.isPending,
    error: mutation.error ? (mutation.error instanceof Error ? mutation.error.message : 'Failed to create conversation') : null
  };
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: (_, conversationId) => {
      // Invalidate queries to update read status
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messaging/conversations', conversationId] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/unread-count'] });
    }
  });

  const markMessagesRead = async (conversationId: string) => {
    try {
      await mutation.mutateAsync(conversationId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  return { markMessagesRead };
}

export function useUnreadCount(enabled: boolean = true) {
  const {
    data,
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['/api/messaging/unread-count'],
    queryFn: getUnreadCount,
    enabled: enabled, // Gate query by authentication status
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: false,
    retry: 1
  });

  return {
    count: data?.count || 0,
    loading,
    refetch: () => refetch()
  };
}

// Hook for getting incoming proposals as potential messaging contacts  
export function useProposalContacts(enabled: boolean = true) {
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['/api/messaging/proposal-contacts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/messaging/proposal-contacts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.contacts || [];
    },
    enabled: enabled, // Gate query by authentication status
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Transform error to match existing interface
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch proposal contacts') : null;

  return { 
    contacts: data || [], 
    loading, 
    error, 
    refetch: () => refetch() 
  };
}