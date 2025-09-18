import { apiRequest } from '@/lib/queryClient';

// Helper function to handle API responses consistently
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

export interface Conversation {
  id: string;
  advocate_id: string;
  parent_id: string;
  student_id: string;
  status: string;
  priority: string;
  archived: boolean;
  title?: string;
  match_proposal_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  advocate: {
    id: string;
    name: string;
    specialty: string;
  } | null;
  student: {
    id: string;
    name: string;
    full_name: string;
  } | null;
  parent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    name: string;
  } | null;
  latest_message?: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    read_at: string | null;
  };
  unread_count: number;
}

export interface ConversationFilters {
  archived?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'active' | 'closed';
  label_ids?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface ConversationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: ConversationPagination;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface MessageHistory {
  conversation: Conversation;
  advocate: {
    id: string;
    name: string;
    specialty: string;
  };
  student: {
    first_name: string;
    last_name: string;
  };
  messages: Message[];
}

// Get conversations with optional filtering and pagination
export async function getConversations(filters: ConversationFilters = {}): Promise<ConversationsResponse> {
  // DEBUG: Log the getConversations call
  console.log('🔍 getConversations DEBUG - Called with filters:', filters);
  
  // Build query parameters
  const params = new URLSearchParams();
  
  if (filters.archived !== undefined) {
    params.append('archived', String(filters.archived));
  }
  if (filters.priority) {
    params.append('priority', filters.priority);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.label_ids && filters.label_ids.length > 0) {
    params.append('label_ids', filters.label_ids.join(','));
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.page) {
    params.append('page', String(filters.page));
  }
  if (filters.limit) {
    params.append('limit', String(filters.limit));
  }
  
  const url = `/api/messaging/conversations${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('🔍 getConversations DEBUG - Making request to:', url);
  
  const response = await apiRequest('GET', url);
  console.log('🔍 getConversations DEBUG - Response status:', response.status);
  
  const data = await handleApiResponse<ConversationsResponse>(response);
  console.log('🔍 getConversations DEBUG - Response data:', data);
  
  return {
    conversations: data.conversations,
    pagination: data.pagination
  };
}

// Create a new conversation
export async function createConversation(data: {
  advocate_id: string;
  student_id: string;
  parent_id: string;
}): Promise<Conversation> {
  const response = await apiRequest('POST', '/api/messaging/conversations', data);
  const result = await handleApiResponse<{ conversation: Conversation }>(response);
  return result.conversation;
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<MessageHistory> {
  const response = await apiRequest('GET', `/api/messaging/conversations/${conversationId}`);
  return handleApiResponse<MessageHistory>(response);
}

// Send a message
export async function sendMessage(data: {
  conversation_id: string;
  content?: string;
  attachments?: Array<{
    file_name: string;
    file_type: string;
    file_size: number;
    file_content: string;
  }>;
}): Promise<Message> {
  const response = await apiRequest('POST', '/api/messaging/messages', data);
  const result = await handleApiResponse<{ message: Message }>(response);
  return result.message;
}

// Mark messages as read
export async function markAsRead(conversationId: string): Promise<void> {
  const response = await apiRequest('POST', `/api/messaging/conversations/${conversationId}/mark-read`);
  await handleApiResponse<{ success: boolean }>(response);
}

// Get unread message count
export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await apiRequest('GET', '/api/messaging/unread-count');
  return handleApiResponse<{ count: number }>(response);
}