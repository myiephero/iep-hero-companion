import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

export function useConversations(filters: ConversationFilters = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pagination, setPagination] = useState<ConversationPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track previous filters and prevent unnecessary re-fetches
  const previousFiltersRef = useRef<string>('');
  const hasInitiallyFetchedRef = useRef(false);

  const fetchConversations = useCallback(async (filtersToUse?: ConversationFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConversations(filtersToUse || {});
      setConversations(response.conversations);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Create a stable string representation of filters
    const filtersString = JSON.stringify(filters);
    
    // Only fetch if filters have actually changed or this is the initial fetch
    if (!hasInitiallyFetchedRef.current || previousFiltersRef.current !== filtersString) {
      previousFiltersRef.current = filtersString;
      hasInitiallyFetchedRef.current = true;
      fetchConversations(filters);
    }
  }, [fetchConversations]); // Remove filters from dependency array to prevent infinite loop

  return {
    conversations,
    pagination,
    loading,
    error,
    refetch: fetchConversations
  };
}

export function useMessages(conversationId: string | null) {
  const [messageHistory, setMessageHistory] = useState<MessageHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getMessages(conversationId);
      setMessageHistory(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  return {
    messageHistory,
    loading,
    error,
    refetch: fetchMessages
  };
}

export function useSendMessage() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (
    conversationId: string, 
    content?: string, 
    documentIds?: string[]
  ): Promise<Message | null> => {
    try {
      setSending(true);
      setError(null);
      const messageData: any = { conversation_id: conversationId };
      
      if (content) {
        messageData.content = content;
      }
      
      if (documentIds && documentIds.length > 0) {
        messageData.documentIds = documentIds;
      }
      
      const message = await sendMessage(messageData);
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    } finally {
      setSending(false);
    }
  };

  return {
    send,
    sending,
    error
  };
}

export function useCreateConversation() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (advocateId: string, studentId: string, parentId: string): Promise<Conversation | null> => {
    try {
      setCreating(true);
      setError(null);
      const conversation = await createConversation({
        advocate_id: advocateId,
        student_id: studentId,
        parent_id: parentId
      });
      return conversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    } finally {
      setCreating(false);
    }
  };

  return {
    create,
    creating,
    error
  };
}

export function useMarkAsRead() {
  const markMessagesRead = async (conversationId: string) => {
    try {
      await markAsRead(conversationId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  return { markMessagesRead };
}

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const data = await getUnreadCount();
      setCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return {
    count,
    loading,
    refetch: fetchUnreadCount
  };
}

// Hook for getting incoming proposals as potential messaging contacts  
export function useProposalContacts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // FIXED: Use authenticated apiRequest instead of direct fetch
      const response = await apiRequest('GET', '/api/messaging/proposal-contacts');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Error fetching proposal contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch proposal contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const refetch = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, error, refetch };
}