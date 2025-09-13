import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MessageSquare, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from "@/hooks/useMessaging";
import { MessageFileUpload, type MessageFile } from "@/components/MessageFileUpload";
import { MessageAttachmentDisplay, type MessageAttachment } from "@/components/MessageAttachmentDisplay";
import type { Conversation } from "@/lib/messaging";

export default function ParentMessages() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<MessageFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // API hooks
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useConversations();
  const { messageHistory, loading: messagesLoading, refetch: refetchMessages } = useMessages(selectedConversation?.id || null);
  const { send: sendMessage, sending } = useSendMessage();
  const { markMessagesRead } = useMarkAsRead();
  
  // Auto-select first conversation when loaded
  if (conversations.length > 0 && !selectedConversation) {
    setSelectedConversation(conversations[0]);
  }

  // Handle sending message with optional attachments
  const handleSendMessage = async () => {
    if (!selectedConversation || sending) return;
    
    const hasContent = newMessageText.trim();
    const hasAttachments = attachmentFiles.some(f => f.status === 'completed');
    
    if (!hasContent && !hasAttachments) return;

    // Prepare attachments data
    const attachments = attachmentFiles
      .filter(f => f.status === 'completed')
      .map(async (fileData) => {
        // Read file as base64 for sending
        const reader = new FileReader();
        const base64Content = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(fileData.file);
        });

        return {
          file_name: fileData.file.name,
          file_type: fileData.file.type,
          file_size: fileData.file.size,
          file_content: base64Content
        };
      });

    try {
      const attachmentData = await Promise.all(attachments);
      
      const message = await sendMessage(
        selectedConversation.id, 
        newMessageText.trim() || undefined,
        attachmentData.length > 0 ? attachmentData : undefined
      );
      
      if (message) {
        // Clear form
        setNewMessageText('');
        setAttachmentFiles([]);
        setShowFileUpload(false);
        
        // Refresh data
        refetchMessages();
        refetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Error handling could be improved with toast notifications
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : conversationsError ? (
                <div className="p-4 text-center text-red-500">
                  Error loading conversations: {conversationsError}
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const advocateName = conversation.advocate.name;
                  const avatar = advocateName.split(' ').map(n => n[0]).join('');
                  const lastMessageTime = conversation.lastMessage?.created_at ? 
                    new Date(conversation.lastMessage.created_at).toLocaleDateString() : 'New';
                    
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={async () => {
                        setSelectedConversation(conversation);
                        if (conversation.unreadCount > 0) {
                          await markMessagesRead(conversation.id);
                          refetchConversations();
                        }
                      }}
                      data-testid={`conversation-${conversation.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/placeholder-${conversation.id}.jpg`} />
                          <AvatarFallback>{avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{advocateName}</p>
                            <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{conversation.advocate.specialty}</p>
                          <p className="text-sm truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="mt-2 text-xs">
                              {conversation.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Conversations Yet</p>
                    <p className="text-sm">Messages from advocates will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation && (
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-1.jpg" />
                    <AvatarFallback>
                      {selectedConversation.advocate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedConversation.advocate.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.advocate.specialty}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {selectedConversation ? (
                messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messageHistory?.messages && messageHistory.messages.length > 0 ? (
                  messageHistory.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === selectedConversation.parent_id ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${message.id}`}
                    >
                      <div className={`max-w-lg p-3 rounded-lg ${
                        message.sender_id === selectedConversation.parent_id 
                          ? 'bg-primary text-primary-foreground ml-12' 
                          : 'bg-muted mr-12'
                      }`}>
                        {message.content && <p className="text-sm">{message.content}</p>}
                        {message.attachments && message.attachments.length > 0 && (
                          <MessageAttachmentDisplay 
                            attachments={message.attachments as MessageAttachment[]} 
                            compact={true}
                          />
                        )}
                        <span className="text-xs opacity-75 block mt-1">
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No Messages Yet</p>
                      <p className="text-sm">Start a conversation with {selectedConversation.advocate.name}</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium mb-2">Select a Conversation</p>
                    <p className="text-sm">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
            
            {selectedConversation && (
              <div className="border-t">
                {/* File Upload Section */}
                {showFileUpload && (
                  <div className="p-4 bg-muted/20 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Attach Files</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowFileUpload(false);
                          setAttachmentFiles([]);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <MessageFileUpload
                      files={attachmentFiles}
                      onFilesChange={setAttachmentFiles}
                      maxFiles={5}
                      disabled={sending}
                    />
                  </div>
                )}
                
                {/* Message Input */}
                <div className="p-4">
                  <div className="flex items-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className={showFileUpload ? 'bg-muted' : ''}
                      data-testid="button-attach-files"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 space-y-2">
                      <Input 
                        placeholder="Type your message..." 
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if ((newMessageText.trim() || attachmentFiles.some(f => f.status === 'completed')) && selectedConversation && !sending) {
                              await handleSendMessage();
                            }
                          }
                        }}
                        data-testid="input-message"
                      />
                      {attachmentFiles.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {attachmentFiles.filter(f => f.status === 'completed').length} of {attachmentFiles.length} files ready
                        </div>
                      )}
                    </div>
                    <Button 
                      size="icon" 
                      disabled={sending || (!newMessageText.trim() && !attachmentFiles.some(f => f.status === 'completed'))}
                      onClick={handleSendMessage}
                      data-testid="button-send-message"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}