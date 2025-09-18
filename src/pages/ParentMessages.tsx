import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { ConversationTable } from "@/components/ui/responsive-table-examples";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useConversations, useMarkAsRead } from "@/hooks/useMessaging";
import { useOptimisticMessaging } from "@/hooks/useOptimisticMessaging";
import { MessageFileUpload, type MessageFile } from "@/components/MessageFileUpload";
import { MessageSearch } from "@/components/MessageSearch";
import { useMessageSearch } from "@/hooks/useMessageSearch";
import { useConversationLabelsForConversation, useUpdateConversationStatus } from "@/hooks/useConversationLabels";
import { useToast } from "@/hooks/use-toast";
import { VirtualizedMessageList } from "@/components/VirtualizedMessageList";
import { AutoGrowingComposer } from "@/components/AutoGrowingComposer";
import { MobileMessageHeader } from "@/components/MobileMessageHeader";
// Removed unused import ConversationLabelsDisplay"
import { SafeAreaFull } from "@/components/mobile/SafeArea";
import type { Conversation } from "@/lib/messaging";
import { cn } from "@/lib/utils";

export default function ParentMessages() {
  // State for conversation and mobile view management
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'conversations' | 'chat'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Composer state
  const [messageText, setMessageText] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<MessageFile[]>([]);
  
  // Mobile UX enhancements
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { toast } = useToast();
  const { updateStatus: updateConversationStatus } = useUpdateConversationStatus();

  // API hooks
  const { 
    conversations, 
    loading: conversationsLoading, 
    error: conversationsError, 
    refetch: refetchConversations 
  } = useConversations();
  
  const { markMessagesRead } = useMarkAsRead();

  // Use optimistic messaging for the selected conversation
  const {
    messages,
    loading: messagesLoading,
    sendMessage: sendOptimisticMessage,
    retryMessage,
    removeFailedMessage,
    getRetryInfo
  } = useOptimisticMessaging(selectedConversation?.id || null);

  // Message search functionality
  const {
    searchTerm: messageSearchTerm,
    setSearchTerm: setMessageSearchTerm,
    currentResultIndex,
    totalResults,
    goToNext,
    goToPrevious,
    clearSearch: clearMessageSearch,
    isCurrentResult,
    hasActiveSearch: hasActiveMessageSearch,
    hasResults: hasMessageSearchResults
  } = useMessageSearch(messages || []);

  // Filtered conversations for the list
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    return conversations.filter(conv => 
      conv.advocate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Auto-select first conversation when available
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMobileView('chat'); // Switch to chat view on mobile
    
    // Mark messages as read
    if (conversation.unread_count > 0) {
      try {
        await markMessagesRead(conversation.id);
        refetchConversations();
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  }, [markMessagesRead, refetchConversations]);

  // Handle message sending with optimistic updates
  const handleSendMessage = useCallback(async () => {
    if (!selectedConversation) return;
    
    const hasContent = messageText.trim();
    const hasAttachments = attachmentFiles.some(f => f.status === 'completed');
    
    if (!hasContent && !hasAttachments) return;

    // Prepare attachments data
    const attachments = attachmentFiles
      .filter(f => f.status === 'completed')
      .map(async (fileData) => {
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
      
      // Send with optimistic update
      await sendOptimisticMessage(
        selectedConversation.id, 
        messageText.trim() || undefined,
        attachmentData.length > 0 ? attachmentData as any : undefined
      );
      
      // Clear form
      setMessageText('');
      setAttachmentFiles([]);
      
      // Update conversations list
      refetchConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedConversation, messageText, attachmentFiles, sendOptimisticMessage, refetchConversations, toast]);

  // Handle message retry
  const handleRetryMessage = useCallback(async (messageId: string) => {
    try {
      await retryMessage(messageId);
      toast({
        title: "Message retry attempted",
        description: "Trying to send your message again...",
      });
    } catch (error) {
      toast({
        title: "Retry failed",
        description: "Unable to retry sending the message.",
        variant: "destructive"
      });
    }
  }, [retryMessage, toast]);

  // Handle keyboard show/hide for mobile optimization
  const handleKeyboardShow = useCallback(() => {
    setIsKeyboardVisible(true);
  }, []);

  const handleKeyboardHide = useCallback(() => {
    setIsKeyboardVisible(false);
  }, []);

  // Mobile back navigation
  const handleMobileBack = useCallback(() => {
    if (mobileView === 'chat') {
      setMobileView('conversations');
      setSelectedConversation(null);
    }
  }, [mobileView]);

  // Current user info (assuming parent is always the current user)
  const currentUser = {
    id: 'current-parent',
    name: 'You',
  };

  const otherUser = selectedConversation?.advocate ? {
    id: selectedConversation.advocate.id,
    name: selectedConversation.advocate.name,
    avatar_url: selectedConversation.advocate.avatar_url
  } : undefined;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        {/* Mobile Layout */}
        <div className="lg:hidden h-full">
          {mobileView === 'conversations' ? (
            /* Mobile Conversations List */
            <Card className="h-full flex flex-col">
              {/* Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SafeAreaFull className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Messages</h1>
                  </div>
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="Search conversations..." 
                      className="pl-10" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="search-conversations"
                    />
                  </div>
                </SafeAreaFull>
              </div>
              
              {/* Conversations List */}
              <div className="flex-1 overflow-hidden">
                <ConversationTable
                  conversations={filteredConversations}
                  loading={conversationsLoading}
                  onOpenConversation={handleSelectConversation}
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
                  <div className="p-4 text-center text-destructive">
                    Error loading conversations: {conversationsError}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* Mobile Chat View */
            <div className="h-full flex flex-col bg-background">
              {/* Mobile Message Header */}
              {selectedConversation && (
                <MobileMessageHeader
                  onBack={handleMobileBack}
                  contactName={selectedConversation.advocate?.name || 'Unknown Advocate'}
                  contactAvatar={selectedConversation.advocate?.avatar_url}
                  contactStatus="online"
                  unreadCount={selectedConversation.unread_count}
                  onSearch={() => setShowSearch(!showSearch)}
                />
              )}

              {/* Message Search (when enabled) */}
              {showSearch && (
                <div className="border-b bg-muted/30 p-4">
                  <MessageSearch
                    searchTerm={messageSearchTerm}
                    onSearchChange={setMessageSearchTerm}
                    currentResultIndex={currentResultIndex}
                    totalResults={totalResults}
                    onNext={goToNext}
                    onPrevious={goToPrevious}
                    onClear={() => {
                      clearMessageSearch();
                      setShowSearch(false);
                    }}
                    hasActiveSearch={hasActiveMessageSearch}
                    hasResults={hasMessageSearchResults}
                  />
                </div>
              )}

              {/* Messages Container */}
              <div className={cn(
                "flex-1 min-h-0 message-list-container",
                isKeyboardVisible && "pb-4"
              )}>
                {selectedConversation ? (
                  <VirtualizedMessageList
                    messages={messages || []}
                    currentUser={currentUser}
                    otherUser={otherUser}
                    loading={messagesLoading}
                    hasActiveSearch={hasActiveMessageSearch}
                    searchTerm={messageSearchTerm}
                    isCurrentResult={isCurrentResult}
                    onRetryMessage={handleRetryMessage}
                    className="h-full"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-Growing Composer */}
              {selectedConversation && (
                <AutoGrowingComposer
                  value={messageText}
                  onChange={setMessageText}
                  onSend={handleSendMessage}
                  onAttachmentsChange={setAttachmentFiles}
                  attachments={attachmentFiles}
                  placeholder={`Message ${selectedConversation.advocate?.name || 'advocate'}...`}
                  maxLength={2000}
                  showCharacterCount={messageText.length > 1600}
                  onKeyboardShow={handleKeyboardShow}
                  onKeyboardHide={handleKeyboardHide}
                  adjustForKeyboard={true}
                />
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-full">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold mb-3">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="search-conversations-desktop"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationTable
                  conversations={filteredConversations}
                  loading={conversationsLoading}
                  onOpenConversation={handleSelectConversation}
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
                  <div className="p-4 text-center text-destructive">
                    Error loading conversations: {conversationsError}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {/* Desktop Header */}
              {selectedConversation && (
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <h3 className="font-semibold">{selectedConversation.advocate?.name || 'Unknown Advocate'}</h3>
                        <p className="text-sm text-muted-foreground">{selectedConversation.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSearch(!showSearch)}
                        data-testid="toggle-search-desktop"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Message Search */}
              {showSearch && (
                <div className="p-4 border-b bg-muted/30">
                  <MessageSearch
                    searchTerm={messageSearchTerm}
                    onSearchChange={setMessageSearchTerm}
                    currentResultIndex={currentResultIndex}
                    totalResults={totalResults}
                    onNext={goToNext}
                    onPrevious={goToPrevious}
                    onClear={() => {
                      clearMessageSearch();
                      setShowSearch(false);
                    }}
                    hasActiveSearch={hasActiveMessageSearch}
                    hasResults={hasMessageSearchResults}
                  />
                </div>
              )}

              {/* Desktop Messages */}
              <div className="flex-1 min-h-0 message-list-container">
                {selectedConversation ? (
                  <VirtualizedMessageList
                    messages={messages || []}
                    currentUser={currentUser}
                    otherUser={otherUser}
                    loading={messagesLoading}
                    hasActiveSearch={hasActiveMessageSearch}
                    searchTerm={messageSearchTerm}
                    isCurrentResult={isCurrentResult}
                    onRetryMessage={handleRetryMessage}
                    className="h-full"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Composer */}
              {selectedConversation && (
                <AutoGrowingComposer
                  value={messageText}
                  onChange={setMessageText}
                  onSend={handleSendMessage}
                  onAttachmentsChange={setAttachmentFiles}
                  attachments={attachmentFiles}
                  placeholder={`Message ${selectedConversation.advocate?.name || 'advocate'}...`}
                  maxLength={2000}
                  showCharacterCount={messageText.length > 1600}
                  adjustForKeyboard={false} // Disable keyboard adjustments on desktop
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}