import { useState, useEffect } from 'react';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  createConversation,
  type Conversation,
  type MessageHistory,
  type Message
} from '../lib/messaging';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
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

  const send = async (conversationId: string, content: string): Promise<Message | null> => {
    try {
      setSending(true);
      setError(null);
      const message = await sendMessage({ conversation_id: conversationId, content });
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