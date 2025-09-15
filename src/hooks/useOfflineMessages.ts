// Offline-aware hook for message management
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync, useOfflineAwareAPI } from '@/hooks/useOfflineSync';
import { storeMessageData, getAllMessages, getMessageData, storeDraftData, getAllDrafts } from '@/lib/offlineStorage';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'sent' | 'received' | 'draft';
  priority: 'high' | 'medium' | 'low';
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  timestamp: string;
  readAt?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  tags?: string[];
  studentId?: string;
  parentMessage?: string; // For replies
}

interface MessageDraft {
  id: string;
  subject: string;
  content: string;
  recipientId?: string;
  recipientName?: string;
  priority: 'high' | 'medium' | 'low';
  studentId?: string;
  lastSaved: string;
  attachments?: File[];
}

export const useOfflineMessages = () => {
  const { user } = useAuth();
  const { isOnline, queueOperation } = useOfflineSync();
  const { makeRequest } = useOfflineAwareAPI();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<MessageDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load messages (online + offline)
  const loadMessages = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from server first
        try {
          const response = await makeRequest('GET', '/api/messages');
          const serverMessages = response.messages || [];
          
          // Store in offline cache
          await Promise.all(
            serverMessages.map((message: Message) =>
              storeMessageData(message.id, message, user.id)
            )
          );
          
          setMessages(serverMessages);
        } catch (networkError) {
          console.warn('Network request failed, falling back to offline data');
          // Fall back to offline data
          const offlineMessages = await getAllMessages(user.id);
          setMessages(offlineMessages);
        }
      } else {
        // Load from offline storage
        const offlineMessages = await getAllMessages(user.id);
        setMessages(offlineMessages);
        
        if (offlineMessages.length === 0) {
          setError('No message data available offline. Please connect to load your messages.');
        }
      }

      // Load drafts from offline storage
      const offlineDrafts = await getAllDrafts(user.id);
      setDrafts(offlineDrafts);
      
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load message data');
      
      // Try to load any available offline data as fallback
      try {
        const offlineMessages = await getAllMessages(user.id);
        const offlineDrafts = await getAllDrafts(user.id);
        setMessages(offlineMessages);
        setDrafts(offlineDrafts);
      } catch (offlineError) {
        console.error('Failed to load offline messages:', offlineError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp' | 'type' | 'senderName'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    const tempId = `temp-message-${Date.now()}`;
    const newMessage: Message = {
      ...messageData,
      id: tempId,
      senderId: user.id,
      senderName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'You',
      type: 'sent',
      timestamp: new Date().toISOString()
    };

    try {
      if (isOnline) {
        // Try to send immediately
        const response = await makeRequest('POST', '/api/messages', newMessage);
        const serverMessage = response.message;
        
        // Store in offline cache
        await storeMessageData(serverMessage.id, serverMessage, user.id);
        
        // Update local state
        setMessages(prev => [...prev, serverMessage]);
        
        toast({
          title: "Message Sent",
          description: `Message "${messageData.subject}" has been sent successfully.`,
          duration: 3000,
        });
        
        return serverMessage;
      } else {
        // Store offline and queue for sync
        await storeMessageData(tempId, newMessage, user.id);
        await queueOperation('create', '/api/messages', newMessage);
        
        // Update local state
        setMessages(prev => [...prev, newMessage]);
        
        toast({
          title: "Message Queued (Offline)",
          description: `Message "${messageData.subject}" will be sent when you're back online.`,
          duration: 3000,
        });
        
        return newMessage;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Save draft
  const saveDraft = async (draftData: Omit<MessageDraft, 'id' | 'lastSaved'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    const draftId = `draft-${Date.now()}`;
    const draft: MessageDraft = {
      ...draftData,
      id: draftId,
      lastSaved: new Date().toISOString()
    };

    try {
      // Always save drafts offline
      await storeDraftData(draftId, draft, user.id);
      
      // Update local state
      setDrafts(prev => {
        // Remove any existing draft with same recipient/subject
        const filtered = prev.filter(d => 
          !(d.recipientId === draft.recipientId && d.subject === draft.subject)
        );
        return [...filtered, draft];
      });
      
      toast({
        title: "Draft Saved",
        description: "Your message has been saved as a draft.",
        duration: 2000,
      });
      
      return draft;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  };

  // Update draft
  const updateDraft = async (draftId: string, updates: Partial<MessageDraft>) => {
    if (!user?.id) throw new Error('User not authenticated');

    const updatedDraft = {
      ...drafts.find(d => d.id === draftId),
      ...updates,
      lastSaved: new Date().toISOString()
    } as MessageDraft;

    try {
      await storeDraftData(draftId, updatedDraft, user.id);
      
      setDrafts(prev => prev.map(d => d.id === draftId ? updatedDraft : d));
      
      return updatedDraft;
    } catch (error) {
      console.error('Error updating draft:', error);
      throw error;
    }
  };

  // Delete draft
  const deleteDraft = async (draftId: string) => {
    if (!user?.id) return;

    try {
      // Remove from local state
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      
      toast({
        title: "Draft Deleted",
        description: "Draft has been deleted.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    if (!user?.id) return;

    const message = messages.find(m => m.id === messageId);
    if (!message || message.readAt) return;

    const updatedMessage = {
      ...message,
      readAt: new Date().toISOString()
    };

    try {
      if (isOnline) {
        // Try to update on server
        await makeRequest('PUT', `/api/messages/${messageId}/read`, { readAt: updatedMessage.readAt });
      } else {
        // Queue for sync
        await queueOperation('update', `/api/messages/${messageId}/read`, { readAt: updatedMessage.readAt });
      }

      // Update offline cache and local state
      await storeMessageData(messageId, updatedMessage, user.id);
      setMessages(prev => prev.map(m => m.id === messageId ? updatedMessage : m));
      
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Get unread messages count
  const getUnreadCount = () => {
    return messages.filter(m => m.type === 'received' && !m.readAt).length;
  };

  // Get messages by type
  const getMessagesByType = (type: Message['type']) => {
    return messages.filter(m => m.type === type);
  };

  // Get messages for specific student
  const getStudentMessages = (studentId: string) => {
    return messages.filter(m => m.studentId === studentId);
  };

  // Search messages
  const searchMessages = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return messages.filter(m => 
      m.subject.toLowerCase().includes(lowercaseQuery) ||
      m.content.toLowerCase().includes(lowercaseQuery) ||
      m.senderName.toLowerCase().includes(lowercaseQuery) ||
      m.recipientName.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Load messages on mount and when user/online status changes
  useEffect(() => {
    loadMessages();
  }, [user?.id, isOnline]);

  return {
    messages,
    drafts,
    loading,
    error,
    sendMessage,
    saveDraft,
    updateDraft,
    deleteDraft,
    markAsRead,
    getUnreadCount,
    getMessagesByType,
    getStudentMessages,
    searchMessages,
    refreshMessages: loadMessages,
    isOffline: !isOnline
  };
};