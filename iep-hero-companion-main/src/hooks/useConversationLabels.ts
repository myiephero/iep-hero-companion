import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types
export interface ConversationLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateLabelData {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
  description?: string;
}

// Hook for fetching conversation labels
export function useConversationLabels() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/messaging/labels'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    labels: (data?.labels || []) as ConversationLabel[],
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
}

// Hook for creating conversation labels
export function useCreateLabel() {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const create = useCallback(async (labelData: CreateLabelData): Promise<ConversationLabel> => {
    setIsCreating(true);
    try {
      const response = await apiRequest('/api/messaging/labels', {
        method: 'POST',
        body: JSON.stringify(labelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create label');
      }

      const data = await response.json();
      
      // Invalidate and refetch labels
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/labels'] });
      
      return data.label;
    } finally {
      setIsCreating(false);
    }
  }, [queryClient]);

  return {
    create,
    creating: isCreating
  };
}

// Hook for updating conversation labels
export function useUpdateLabel() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const update = useCallback(async (labelId: string, labelData: UpdateLabelData): Promise<ConversationLabel> => {
    setIsUpdating(true);
    try {
      const response = await apiRequest(`/api/messaging/labels/${labelId}`, {
        method: 'PUT',
        body: JSON.stringify(labelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update label');
      }

      const data = await response.json();
      
      // Invalidate and refetch labels
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/labels'] });
      
      return data.label;
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  return {
    update,
    updating: isUpdating
  };
}

// Hook for deleting conversation labels
export function useDeleteLabel() {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteLabel = useCallback(async (labelId: string): Promise<void> => {
    setIsDeleting(true);
    try {
      const response = await apiRequest(`/api/messaging/labels/${labelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete label');
      }
      
      // Invalidate and refetch labels
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/labels'] });
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  return {
    delete: deleteLabel,
    deleting: isDeleting
  };
}

// Hook for fetching labels assigned to a specific conversation
export function useConversationLabelsForConversation(conversationId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/messaging/conversations', conversationId, 'labels'],
    queryFn: async () => {
      const response = await apiRequest(`/api/messaging/conversations/${conversationId}/labels`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation labels');
      }
      return response.json();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    labels: (data?.labels || []) as ConversationLabel[],
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
}

// Hook for assigning labels to conversations
export function useAssignLabels() {
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();

  const assign = useCallback(async (conversationId: string, labelIds: string[]): Promise<void> => {
    setIsAssigning(true);
    try {
      const response = await apiRequest(`/api/messaging/conversations/${conversationId}/labels`, {
        method: 'POST',
        body: JSON.stringify({ label_ids: labelIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign labels');
      }
      
      // Invalidate conversation labels and conversations list
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messaging/conversations', conversationId, 'labels'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messaging/conversations'] 
      });
    } finally {
      setIsAssigning(false);
    }
  }, [queryClient]);

  return {
    assign,
    assigning: isAssigning
  };
}

// Hook for updating conversation status (archive, priority, etc.)
export function useUpdateConversationStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const updateStatus = useCallback(async (conversationId: string, updates: {
    archived?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    status?: 'active' | 'archived' | 'closed';
  }) => {
    setIsUpdating(true);
    try {
      const response = await apiRequest(`/api/messaging/conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update conversation status');
      }

      const data = await response.json();
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messaging/conversations'] 
      });
      
      return data.conversation;
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  return {
    updateStatus,
    updating: isUpdating
  };
}