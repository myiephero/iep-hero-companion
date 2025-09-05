const API_BASE = '/api';

// Simple API request function for messaging
async function request(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
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
  const response = await request('/messaging/conversations');
  return response.json();
}

// Create a new conversation
export async function createConversation(data: {
  advocate_id: string;
  student_id: string;
}): Promise<Conversation> {
  const response = await request('/messaging/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<MessageHistory> {
  const response = await request(`/messaging/conversations/${conversationId}/messages`);
  return response.json();
}

// Send a message
export async function sendMessage(data: {
  conversation_id: string;
  content: string;
}): Promise<Message> {
  const response = await request('/messaging/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Mark messages as read
export async function markAsRead(conversationId: string): Promise<void> {
  await request(`/messaging/conversations/${conversationId}/read`, {
    method: 'PUT',
  });
}

// Get unread message count
export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await request('/messaging/unread-count');
  return response.json();
}