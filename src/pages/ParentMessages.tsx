import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MessageSquare, Loader2, X, Archive, ArchiveRestore, AlertTriangle, ChevronUp, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from "@/hooks/useMessaging";
import { MessageFileUpload, type MessageFile } from "@/components/MessageFileUpload";
import { MessageAttachmentDisplay, type MessageAttachment } from "@/components/MessageAttachmentDisplay";
import { MessageSearch } from "@/components/MessageSearch";
import { MessageHighlight } from "@/components/MessageHighlight";
import { useMessageSearch } from "@/hooks/useMessageSearch";
import { ConversationLabelManager } from "@/components/ConversationLabelManager";
import { ConversationFilters } from "@/components/ConversationFilters";
import { ConversationLabelSelector } from "@/components/ConversationLabelSelector";
import { useConversationLabelsForConversation, useUpdateConversationStatus } from "@/hooks/useConversationLabels";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Conversation } from "@/lib/messaging";

// Conversation Actions Menu Component
function ConversationActionsMenu({ conversation }: { conversation: Conversation }) {
  const { updateStatus } = useUpdateConversationStatus();
  const { toast } = useToast();
  
  const handleArchiveToggle = async () => {
    try {
      await updateStatus(conversation.id, { archived: !conversation.archived });
      toast({
        title: conversation.archived ? "Conversation unarchived" : "Conversation archived",
        description: conversation.archived 
          ? "Conversation moved back to active conversations." 
          : "Conversation moved to archived conversations."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation status.",
        variant: "destructive"
      });
    }
  };
  
  const handlePriorityChange = async (priority: 'low' | 'normal' | 'high' | 'urgent') => {
    try {
      await updateStatus(conversation.id, { priority });
      toast({
        title: "Priority updated",
        description: `Conversation priority set to ${priority}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation priority.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`conversation-menu-${conversation.id}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleArchiveToggle} data-testid={`conversation-${conversation.archived ? 'unarchive' : 'archive'}-${conversation.id}`}>
          {conversation.archived ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handlePriorityChange('urgent')} data-testid={`conversation-priority-urgent-${conversation.id}`}>
          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
          Mark as Urgent
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePriorityChange('high')} data-testid={`conversation-priority-high-${conversation.id}`}>
          <ChevronUp className="mr-2 h-4 w-4 text-orange-500" />
          Mark as High Priority
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePriorityChange('normal')} data-testid={`conversation-priority-normal-${conversation.id}`}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Mark as Normal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePriorityChange('low')} data-testid={`conversation-priority-low-${conversation.id}`}>
          <ChevronUp className="mr-2 h-4 w-4 text-gray-500 rotate-180" />
          Mark as Low Priority
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Conversation Labels Display Component
function ConversationLabelsDisplay({ conversationId }: { conversationId: string }) {
  const { labels, loading } = useConversationLabelsForConversation(conversationId);
  
  if (loading || !labels || labels.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {labels.slice(0, 3).map((label) => (
        <Badge
          key={label.id}
          style={{
            backgroundColor: label.color,
            color: '#ffffff',
            borderColor: label.color
          }}
          className="text-xs px-1 py-0 h-5"
          data-testid={`conversation-label-${conversationId}-${label.id}`}
        >
          {label.name}
        </Badge>
      ))}
      {labels.length > 3 && (
        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
          +{labels.length - 3}
        </Badge>
      )}
    </div>
  );
}

export default function ParentMessages() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<MessageFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Conversation management state
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    archived: null as boolean | null,
    labels: [] as string[]
  });
  
  const { toast } = useToast();
  const { updateStatus: updateConversationStatus } = useUpdateConversationStatus();
  
  // API hooks
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useConversations();
  const { messageHistory, loading: messagesLoading, refetch: refetchMessages } = useMessages(selectedConversation?.id || null);
  const { send: sendMessage, sending } = useSendMessage();
  const { markMessagesRead } = useMarkAsRead();
  
  // Message search functionality
  const {
    searchTerm,
    setSearchTerm,
    currentResultIndex,
    totalResults,
    goToNext,
    goToPrevious,
    clearSearch,
    isCurrentResult,
    hasActiveSearch,
    hasResults,
    currentSearchResult
  } = useMessageSearch(messageHistory?.messages || []);
  
  // Ref for auto-scroll to current search result
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Filtered conversations based on active filters
  const filteredConversations = useMemo(() => {
    if (!conversations.length) return [];
    
    return conversations.filter(conversation => {
      // Filter by archive status
      if (filters.archived !== null) {
        if (filters.archived && !conversation.archived) return false;
        if (!filters.archived && conversation.archived) return false;
      }
      
      // Filter by status
      if (filters.status.length > 0) {
        if (!filters.status.includes(conversation.status || 'active')) return false;
      }
      
      // Filter by priority
      if (filters.priority.length > 0) {
        if (!filters.priority.includes(conversation.priority || 'normal')) return false;
      }
      
      return true;
    });
  }, [conversations, filters]);
  
  // Auto-select first conversation when loaded
  if (conversations.length > 0 && !selectedConversation) {
    setSelectedConversation(conversations[0]);
  }
  
  // Auto-scroll to current search result
  useEffect(() => {
    if (currentSearchResult && messagesContainerRef.current) {
      const messageElement = messagesContainerRef.current.querySelector(
        `[data-message-id="${currentSearchResult.message.id}"]`
      );
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [currentSearchResult]);

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
        attachmentData.length > 0 ? attachmentData as any : undefined
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
                  const advocateName = conversation.advocate?.name || 'Advocate';
                  const avatar = (advocateName || 'A').split(' ').map(n => n[0]).join('');
                  const lastMessageTime = conversation.latest_message?.created_at ? 
                    new Date(conversation.latest_message.created_at).toLocaleDateString() : 'New';
                    
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={async () => {
                        setSelectedConversation(conversation);
                        if (conversation.unread_count > 0) {
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
                            <p className="font-bold truncate">{advocateName}</p>
                            <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{conversation.student?.full_name || 'Student'}</p>
                          {conversation.latest_message?.content && (
                            <p className="text-sm truncate">
                              {conversation.latest_message.content}
                            </p>
                          )}
                          {conversation.unread_count > 0 && (
                            <Badge variant="default" className="mt-2 text-xs">
                              {conversation.unread_count} new
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
            
            {/* Message Search */}
            {selectedConversation && messageHistory?.messages && messageHistory.messages.length > 0 && (
              <MessageSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                currentResult={currentResultIndex}
                totalResults={totalResults}
                onNext={goToNext}
                onPrevious={goToPrevious}
                onClear={clearSearch}
                placeholder="Search conversation messages..."
              />
            )}
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={messagesContainerRef}>
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
                      data-message-id={message.id}
                    >
                      <div className={`max-w-lg p-3 rounded-lg ${
                        message.sender_id === selectedConversation.parent_id 
                          ? 'bg-primary text-primary-foreground ml-12' 
                          : 'bg-muted mr-12'
                      }`}>
                        {message.content && (
                          <p className="text-sm">
                            <MessageHighlight
                              text={message.content}
                              searchTerm={searchTerm}
                              isCurrentResult={isCurrentResult(message.id)}
                              className="break-words"
                            />
                          </p>
                        )}
                        {(message as any).attachments && (message as any).attachments.length > 0 && (
                          <MessageAttachmentDisplay 
                            attachments={(message as any).attachments as MessageAttachment[]} 
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