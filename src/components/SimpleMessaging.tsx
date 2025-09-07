import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Plus } from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'parent' | 'advocate';
  content: string;
  message_type: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  status: string;
  lastMessageAt: string;
  createdAt: string;
  parentId?: string;
  advocateId?: string;
  studentId?: string;
}

interface SimpleMessagingProps {
  userRole: 'parent' | 'advocate';
  userId: string;
}

export default function SimpleMessaging({ userRole, userId }: SimpleMessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/simple-messages/test-conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to load conversations:', response.status);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/simple-messages/test-conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to load messages:', response.status);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/simple-messages/test-conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Reload messages to show the new one
        await loadMessages(selectedConversation.id);
        // Reload conversations to update last message time
        await loadConversations();
      } else {
        console.error('Failed to send message:', response.status);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Handle conversation selection
  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a conversation to begin messaging</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{conversation.title}</h4>
                      <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {conversation.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conversation.lastMessageAt ? formatDate(conversation.lastMessageAt) : 'No messages'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {selectedConversation ? selectedConversation.title : 'Select a conversation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {selectedConversation ? (
            <div className="flex flex-col h-[500px]">
              {/* Messages List */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === userId ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_id === userId
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs opacity-70 capitalize">
                              {message.sender_type}
                            </span>
                            <span className="text-xs opacity-70">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="sm"
                    className="self-end"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Welcome to Messages</p>
                <p>Select a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}