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
  created_at: string;
  updated_at: string;
  advocate: {
    id: string;
    name: string;
    specialty: string;
  };
  student: {
    first_name: string;
    last_name: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
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

// Get all conversations for the current user
export async function getConversations(): Promise<Conversation[]> {
  const response = await apiRequest('GET', '/api/messaging/conversations');
  const data = await handleApiResponse<{ conversations: any[] }>(response);
  
  // Map server fields to client expected field names
  return data.conversations.map(conversation => ({
    ...conversation,
    lastMessage: conversation.latest_message ? {
      content: conversation.latest_message.content,
      created_at: conversation.latest_message.created_at,
      sender_id: conversation.latest_message.sender_id
    } : undefined,
    unreadCount: conversation.unread_count || 0
  }));
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
  content: string;
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