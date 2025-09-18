import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MessageSquare, Loader2, X, Archive, ArchiveRestore, AlertTriangle, ChevronUp, MoreHorizontal } from "lucide-react";
import { ConversationTable } from "@/components/ui/responsive-table-examples";
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
  
  // Mobile view state for responsive design
  const [mobileView, setMobileView] = useState<'conversations' | 'chat'>('conversations');
  
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
      <div className="h-[calc(100vh-8rem)]">
        {/* Mobile Layout - Show either conversations list OR chat */}
        <div className="lg:hidden h-full">
          {mobileView === 'conversations' ? (
            /* Conversations List - Mobile */
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold mb-3">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationTable
                  conversations={conversations}
                  loading={conversationsLoading}
                  onOpenConversation={async (conversation) => {
                    setSelectedConversation(conversation);
                    setMobileView('chat'); // Switch to chat view on mobile
                    if (conversation.unread_count > 0) {
                      await markMessagesRead(conversation.id);
                      refetchConversations();
                    }
                  }}
                  onArchive={async (conversation) => {
                    try {
                      await updateConversationStatus(conversation.id, { archived: !conversation.archived });
                      refetchConversations();
                    } catch (error) {
                      console.error('Error archiving conversation:', error);
                    }
                  }}
                  onMarkUrgent={async (conversation) => {
                    try {
                      await updateConversationStatus(conversation.id, { priority: 'urgent' });
                      refetchConversations();
                    } catch (error) {
                      console.error('Error marking conversation urgent:', error);
                    }
                  }}
                />
                {!conversationsLoading && conversationsError && (
                  <div className="p-4 text-center text-red-500">
                    Error loading conversations: {conversationsError}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* Chat View - Mobile */
            <Card className="h-full flex flex-col">
              {selectedConversation && (
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setMobileView('conversations')}
                      className="mr-3"
                    >
                      ← Back
                    </Button>
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConversation.advocate?.avatar_url} alt={selectedConversation.advocate?.name || 'Advocate'} />
                        <AvatarFallback>
                          {selectedConversation.advocate?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{selectedConversation.advocate?.name || 'Unknown Advocate'}</h3>
                        <p className="text-sm text-muted-foreground">{selectedConversation.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ConversationLabelsDisplay conversationId={selectedConversation.id} />
                      <ConversationActionsMenu conversation={selectedConversation} />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedConversation && (
                <>
                  {/* Message Search */}
                  <div className="p-4 border-b">
                    <MessageSearch
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      currentResultIndex={currentResultIndex}
                      totalResults={totalResults}
                      onNext={goToNext}
                      onPrevious={goToPrevious}
                      onClear={clearSearch}
                      hasActiveSearch={hasActiveSearch}
                      hasResults={hasResults}
                    />
                  </div>

                  {/* Messages */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messageHistory?.messages?.length > 0 ? (
                      messageHistory.messages.map((message) => (
                        <div 
                          key={message.id} 
                          data-message-id={message.id}
                          className={`flex ${message.sender_type === 'parent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${
                            message.sender_type === 'parent' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          } rounded-lg p-3`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {message.sender_type === 'parent' ? 'You' : selectedConversation.advocate?.name}
                              </span>
                              <span className="text-xs opacity-70">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            {hasActiveSearch ? (
                              <MessageHighlight
                                text={message.content}
                                searchTerm={searchTerm}
                                isCurrentResult={isCurrentResult(message)}
                              />
                            ) : (
                              <p>{message.content}</p>
                            )}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment: MessageAttachment, index) => (
                                  <MessageAttachmentDisplay 
                                    key={index}
                                    attachment={attachment}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start a conversation with your advocate</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    {showFileUpload && (
                      <div className="mb-4">
                        <MessageFileUpload
                          files={attachmentFiles}
                          onFilesChange={setAttachmentFiles}
                          onClose={() => setShowFileUpload(false)}
                        />
                      </div>
                    )}
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <textarea
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          data-testid="message-input"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFileUpload(!showFileUpload)}
                          data-testid="attach-file-button"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={(!newMessageText.trim() && !attachmentFiles.some(f => f.status === 'completed')) || sending}
                          data-testid="send-message-button"
                        >
                          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!selectedConversation && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
        
        {/* Desktop Layout - Show both conversations list AND chat side by side */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-full">
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
                <ConversationTable
                  conversations={conversations}
                  loading={conversationsLoading}
                  onOpenConversation={async (conversation) => {
                    setSelectedConversation(conversation);
                    if (conversation.unread_count > 0) {
                      await markMessagesRead(conversation.id);
                      refetchConversations();
                    }
                  }}
                  onArchive={async (conversation) => {
                    try {
                      await updateConversationStatus(conversation.id, { archived: !conversation.archived });
                      refetchConversations();
                    } catch (error) {
                      console.error('Error archiving conversation:', error);
                    }
                  }}
                  onMarkUrgent={async (conversation) => {
                    try {
                      await updateConversationStatus(conversation.id, { priority: 'urgent' });
                      refetchConversations();
                    } catch (error) {
                      console.error('Error marking conversation urgent:', error);
                    }
                  }}
                />
                {!conversationsLoading && conversationsError && (
                  <div className="p-4 text-center text-red-500">
                    Error loading conversations: {conversationsError}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConversation.advocate?.avatar_url} alt={selectedConversation.advocate?.name || 'Advocate'} />
                        <AvatarFallback>
                          {selectedConversation.advocate?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedConversation.advocate?.name || 'Unknown Advocate'}</h3>
                        <p className="text-sm text-muted-foreground">{selectedConversation.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ConversationLabelsDisplay conversationId={selectedConversation.id} />
                      <ConversationActionsMenu conversation={selectedConversation} />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedConversation && (
                <>
                  {/* Message Search */}
                  <div className="p-4 border-b">
                    <MessageSearch
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      currentResultIndex={currentResultIndex}
                      totalResults={totalResults}
                      onNext={goToNext}
                      onPrevious={goToPrevious}
                      onClear={clearSearch}
                      hasActiveSearch={hasActiveSearch}
                      hasResults={hasResults}
                    />
                  </div>

                  {/* Messages */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messageHistory?.messages?.length > 0 ? (
                      messageHistory.messages.map((message) => (
                        <div 
                          key={message.id} 
                          data-message-id={message.id}
                          className={`flex ${message.sender_type === 'parent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${
                            message.sender_type === 'parent' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          } rounded-lg p-3`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {message.sender_type === 'parent' ? 'You' : selectedConversation.advocate?.name}
                              </span>
                              <span className="text-xs opacity-70">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            {hasActiveSearch ? (
                              <MessageHighlight
                                text={message.content}
                                searchTerm={searchTerm}
                                isCurrentResult={isCurrentResult(message)}
                              />
                            ) : (
                              <p>{message.content}</p>
                            )}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment: MessageAttachment, index) => (
                                  <MessageAttachmentDisplay 
                                    key={index}
                                    attachment={attachment}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start a conversation with your advocate</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    {showFileUpload && (
                      <div className="mb-4">
                        <MessageFileUpload
                          files={attachmentFiles}
                          onFilesChange={setAttachmentFiles}
                          onClose={() => setShowFileUpload(false)}
                        />
                      </div>
                    )}
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <textarea
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          data-testid="message-input"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFileUpload(!showFileUpload)}
                          data-testid="attach-file-button"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={(!newMessageText.trim() && !attachmentFiles.some(f => f.status === 'completed')) || sending}
                          data-testid="send-message-button"
                        >
                          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!selectedConversation && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}