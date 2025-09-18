import { useState, useCallback, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, type Message } from '../lib/messaging';
import { useMessages } from './useMessaging';
import type { OptimisticMessage } from '@/components/VirtualizedMessageList';

interface OptimisticSendData {
  conversationId: string;
  content?: string;
  attachments?: any[];
}

interface RetryState {
  attempts: number;
  nextRetryAt: number;
  exponentialDelay: number;
}

const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds

export function useOptimisticMessaging(conversationId: string | null) {
  const queryClient = useQueryClient();
  const [optimisticMessages, setOptimisticMessages] = useState<Map<string, OptimisticMessage>>(new Map());
  const [retryStates, setRetryStates] = useState<Map<string, RetryState>>(new Map());
  const retryTimeouts = useRef<Map<string, number>>(new Map());

  // Get base messages from the regular hook
  const { 
    messageHistory, 
    loading, 
    error, 
    refetch 
  } = useMessages(conversationId, !!conversationId);

  // Generate optimistic message ID
  const generateOptimisticId = useCallback(() => {
    return `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Calculate exponential backoff delay
  const calculateRetryDelay = useCallback((attempts: number): number => {
    const delay = BASE_RETRY_DELAY * Math.pow(2, attempts - 1);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return Math.min(delay + jitter, MAX_RETRY_DELAY);
  }, []);

  // Merge real messages with optimistic messages
  const mergedMessages = useMemo((): OptimisticMessage[] => {
    const realMessages: OptimisticMessage[] = (messageHistory?.messages || []).map(msg => {
      // Determine sender_type based on sender_id comparison with conversation participants
      let sender_type: 'parent' | 'advocate' = 'advocate'; // default fallback
      
      if (messageHistory?.conversation) {
        // If sender is the parent, it's from parent
        if (msg.sender_id === messageHistory.conversation.parent_id) {
          sender_type = 'parent';
        }
        // If sender is the advocate, it's from advocate
        else if (msg.sender_id === messageHistory.conversation.advocate_id) {
          sender_type = 'advocate';
        }
      }
      
      return {
        ...msg,
        sender_type,
        sending: false,
        failed: false,
        delivered: true
      };
    });

    // Add optimistic messages that aren't yet confirmed
    const optimisticList = Array.from(optimisticMessages.values());
    const allMessages = [...realMessages, ...optimisticList];

    // Sort by creation time
    return allMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messageHistory, optimisticMessages]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (data: OptimisticSendData) => {
      const messageData: any = { conversation_id: data.conversationId };
      
      if (data.content) {
        messageData.content = data.content;
      }
      
      if (data.attachments && data.attachments.length > 0) {
        messageData.attachments = data.attachments;
      }
      
      return sendMessage(messageData);
    },
    onSuccess: (result, variables, context: any) => {
      const optimisticId = context?.optimisticId;
      
      if (optimisticId) {
        // Remove optimistic message
        setOptimisticMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(optimisticId);
          return newMap;
        });

        // Clear retry state
        setRetryStates(prev => {
          const newMap = new Map(prev);
          newMap.delete(optimisticId);
          return newMap;
        });

        // Clear retry timeout
        const timeout = retryTimeouts.current.get(optimisticId);
        if (timeout) {
          clearTimeout(timeout);
          retryTimeouts.current.delete(optimisticId);
        }
      }

      // Invalidate queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messaging/conversations', variables.conversationId] 
      });
    },
    onError: (error, variables, context: any) => {
      const optimisticId = context?.optimisticId;
      
      if (optimisticId) {
        // Mark message as failed
        setOptimisticMessages(prev => {
          const newMap = new Map(prev);
          const message = newMap.get(optimisticId);
          if (message) {
            newMap.set(optimisticId, {
              ...message,
              sending: false,
              failed: true,
              delivered: false
            });
          }
          return newMap;
        });

        // Update retry state
        setRetryStates(prev => {
          const newMap = new Map(prev);
          const currentState = newMap.get(optimisticId) || { attempts: 0, nextRetryAt: 0, exponentialDelay: BASE_RETRY_DELAY };
          const nextAttempt = currentState.attempts + 1;
          
          if (nextAttempt <= MAX_RETRY_ATTEMPTS) {
            const delay = calculateRetryDelay(nextAttempt);
            newMap.set(optimisticId, {
              attempts: nextAttempt,
              nextRetryAt: Date.now() + delay,
              exponentialDelay: delay
            });

            // Schedule automatic retry
            const timeout = setTimeout(() => {
              retryMessage(optimisticId);
            }, delay);
            
            retryTimeouts.current.set(optimisticId, timeout as number);
          }

          return newMap;
        });
      }

      console.error('Failed to send message:', error);
    }
  });

  // Send message with optimistic update
  const sendOptimisticMessage = useCallback(async (
    conversationId: string,
    content?: string,
    attachments?: any[]
  ) => {
    if (!conversationId) return null;

    const optimisticId = generateOptimisticId();
    const now = new Date().toISOString();

    // Create optimistic message
    const optimisticMessage: OptimisticMessage = {
      id: optimisticId,
      content: content || '',
      sender_type: 'parent',
      created_at: now,
      attachments: attachments || [],
      sending: true,
      failed: false,
      delivered: false
    };

    // Add to optimistic state immediately
    setOptimisticMessages(prev => new Map(prev).set(optimisticId, optimisticMessage));

    // Send the message
    try {
      await sendMutation.mutateAsync(
        { conversationId, content, attachments }
      );
      return optimisticMessage;
    } catch (error) {
      console.error('Send message error:', error);
      return null;
    }
  }, [generateOptimisticId, sendMutation]);

  // Retry failed message
  const retryMessage = useCallback(async (optimisticId: string) => {
    const message = optimisticMessages.get(optimisticId);
    const retryState = retryStates.get(optimisticId);

    if (!message || !conversationId || (retryState && retryState.attempts >= MAX_RETRY_ATTEMPTS)) {
      return;
    }

    // Clear existing timeout
    const existingTimeout = retryTimeouts.current.get(optimisticId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      retryTimeouts.current.delete(optimisticId);
    }

    // Mark as sending again
    setOptimisticMessages(prev => {
      const newMap = new Map(prev);
      const currentMessage = newMap.get(optimisticId);
      if (currentMessage) {
        newMap.set(optimisticId, {
          ...currentMessage,
          sending: true,
          failed: false
        });
      }
      return newMap;
    });

    // Attempt to send again
    try {
      await sendMutation.mutateAsync(
        { 
          conversationId, 
          content: message.content, 
          attachments: message.attachments 
        }
      );
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }, [optimisticMessages, retryStates, conversationId, sendMutation]);

  // Remove failed message (user gives up)
  const removeFailedMessage = useCallback((optimisticId: string) => {
    setOptimisticMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(optimisticId);
      return newMap;
    });

    setRetryStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(optimisticId);
      return newMap;
    });

    const timeout = retryTimeouts.current.get(optimisticId);
    if (timeout) {
      clearTimeout(timeout);
      retryTimeouts.current.delete(optimisticId);
    }
  }, []);

  // Get retry info for a message
  const getRetryInfo = useCallback((optimisticId: string) => {
    const retryState = retryStates.get(optimisticId);
    if (!retryState) return null;

    const now = Date.now();
    const timeUntilRetry = Math.max(0, retryState.nextRetryAt - now);

    return {
      attempts: retryState.attempts,
      maxAttempts: MAX_RETRY_ATTEMPTS,
      canRetry: retryState.attempts < MAX_RETRY_ATTEMPTS,
      timeUntilAutoRetry: timeUntilRetry,
      nextRetryAt: retryState.nextRetryAt
    };
  }, [retryStates]);

  // Clean up timeouts on unmount
  useState(() => {
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  });

  return {
    messages: mergedMessages,
    loading: loading && mergedMessages.length === 0,
    error,
    refetch,
    sendMessage: sendOptimisticMessage,
    retryMessage,
    removeFailedMessage,
    getRetryInfo,
    sending: sendMutation.isPending
  };
}