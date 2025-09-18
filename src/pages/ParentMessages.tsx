import { 
  MobileAppShell,
  PremiumMobileHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MessageSquare, Loader2, X, Archive, ArchiveRestore, AlertTriangle, ChevronUp, MoreHorizontal, ArrowLeft, ChevronLeft } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// Premium Conversation Card Component
function PremiumConversationCard({ conversation, onClick }: { conversation: Conversation; onClick: () => void }) {
  // 🐛 DEBUG: Trace PremiumConversationCard render calls
  console.log('🟢 PremiumConversationCard RENDER START for conversation:', {
    id: conversation.id,
    conversation: conversation,
    hasAdvocate: !!conversation.advocate,
    advocateName: conversation.advocate?.name,
    advocateSpecialty: conversation.advocate?.specialty,
    unreadCount: conversation.unread_count,
    latestMessage: conversation.latest_message,
    archived: conversation.archived,
    status: conversation.status,
    priority: conversation.priority
  });
  
  const hasUnread = conversation.unread_count > 0;
  const lastMessage = conversation.latest_message;
  const priorityColors = {
    urgent: 'text-red-500 dark:text-red-400',
    high: 'text-orange-500 dark:text-orange-400',
    normal: 'text-gray-500 dark:text-gray-400',
    low: 'text-gray-400 dark:text-gray-500'
  };
  
  // 🐛 DEBUG: Check for critical data issues
  if (!conversation.advocate) {
    console.error('❌ PremiumConversationCard ERROR: Missing advocate data for conversation:', conversation.id);
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-800 dark:text-red-200 text-sm font-medium">⚠️ DEBUG: Missing advocate data</p>
        <p className="text-red-600 dark:text-red-400 text-xs mt-1">Conversation ID: {conversation.id}</p>
      </div>
    );
  }
  
  if (!conversation.advocate.name) {
    console.error('❌ PremiumConversationCard ERROR: Missing advocate name for conversation:', conversation.id, conversation.advocate);
  }
  
  console.log('🟢 PremiumConversationCard RENDER proceeding with valid data');
  
  // 🐛 DEBUG: About to return JSX
  console.log('🟢 PremiumConversationCard RETURNING JSX for:', conversation.id);
  
  try {
    return (
      <PremiumCard 
        variant="interactive" 
        onClick={onClick}
        className={cn(
          "p-4 relative overflow-hidden",
          hasUnread && "ring-2 ring-blue-500/20 dark:ring-blue-400/20"
        )}
        data-testid={`conversation-card-${conversation.id}`}
      >
      {/* Unread indicator gradient */}
      {hasUnread && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600" />
      )}
      
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-900 shadow-lg">
          <AvatarImage src="/placeholder-1.jpg" />
          <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
            {conversation.advocate.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-semibold text-gray-900 dark:text-gray-100 truncate",
              hasUnread && "text-blue-900 dark:text-blue-100"
            )}>
              {conversation.advocate?.name || 'Unknown Advocate'}
            </h3>
            <div className="flex items-center gap-2">
              {conversation.priority && conversation.priority !== 'normal' && (
                <AlertTriangle className={cn("h-4 w-4", priorityColors[conversation.priority as keyof typeof priorityColors])} />
              )}
              {hasUnread && (
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-0.5 h-5">
                  {conversation.unread_count}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {conversation.advocate.specialty}
          </p>
          
          {lastMessage && (
            <p className={cn(
              "text-sm truncate",
              hasUnread 
                ? "text-gray-900 dark:text-gray-100 font-medium" 
                : "text-gray-600 dark:text-gray-400"
            )}>
              {lastMessage.content || '📎 Attachment'}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <ConversationLabelsDisplay conversationId={conversation.id} />
            {lastMessage && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(lastMessage.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
    );
  } catch (error) {
    console.error('❌ PremiumConversationCard JSX RENDER ERROR:', error, 'for conversation:', conversation.id);
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-800 dark:text-red-200 text-sm font-medium">⚠️ DEBUG: JSX Render Error</p>
        <p className="text-red-600 dark:text-red-400 text-xs mt-1">Conversation: {conversation.id}</p>
        <p className="text-red-600 dark:text-red-400 text-xs">Error: {String(error)}</p>
      </div>
    );
  }
}

// Conversation Labels Display Component
function ConversationLabelsDisplay({ conversationId }: { conversationId: string }) {
  const { labels, loading } = useConversationLabelsForConversation(conversationId);
  
  if (loading || !labels || labels.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {labels.slice(0, 2).map((label) => (
        <Badge
          key={label.id}
          style={{
            backgroundColor: label.color,
            color: '#ffffff',
            borderColor: label.color
          }}
          className="text-xs px-1.5 py-0.5 h-5 rounded-md"
          data-testid={`conversation-label-${conversationId}-${label.id}`}
        >
          {label.name}
        </Badge>
      ))}
      {labels.length > 2 && (
        <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 rounded-md">
          +{labels.length - 2}
        </Badge>
      )}
    </div>
  );
}

export default function ParentMessages() {
  // Authentication check
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<MessageFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Mobile-specific view state
  const [currentView, setCurrentView] = useState<'conversations' | 'chat'>('conversations');
  const [showSearch, setShowSearch] = useState(false);
  
  // Conversation management state
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    archived: null as boolean | null,
    labels: [] as string[]
  });
  
  const { toast } = useToast();
  const { updateStatus: updateConversationStatus } = useUpdateConversationStatus();
  
  // API hooks - gated by authentication status
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useConversations({}, isAuthenticated);
  
  // 🐛 DEBUG: Monitor conversations hook state changes
  useEffect(() => {
    console.log('🔍 ParentMessages DEBUG - Conversations hook state change:', {
      conversationsCount: conversations?.length || 0,
      conversationsLoading,
      conversationsError,
      isAuthenticated,
      hookEnabled: isAuthenticated,
      timestamp: new Date().toISOString(),
      conversationsSample: conversations?.slice(0, 2).map(c => ({
        id: c.id,
        hasAdvocate: !!c.advocate,
        advocateName: c.advocate?.name
      }))
    });
  }, [conversations, conversationsLoading, conversationsError, isAuthenticated]);
  const { messageHistory, loading: messagesLoading, refetch: refetchMessages } = useMessages(selectedConversation?.id || null, isAuthenticated);
  const { send: sendMessage, sending } = useSendMessage();
  const { markMessagesRead } = useMarkAsRead();
  
  // 🐛 DEBUG: Add comprehensive authentication tracing
  const currentAuthToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  console.log('🔍 ParentMessages DEBUG - Authentication status:', { 
    isAuthenticated, 
    authLoading, 
    user: user?.id,
    userFull: user,
    hasAuthToken: !!currentAuthToken,
    authToken: currentAuthToken ? `[PRESENT: ${currentAuthToken.substring(0, 20)}...]` : '[MISSING]',
    timestamp: new Date().toISOString()
  });
  
  // 🐛 DEBUG: Check for token changes
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    console.log('🔍 ParentMessages DEBUG - Token check on mount/change:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      isAuthenticated,
      userLoaded: !!user
    });
  }, [isAuthenticated, user]);
  console.log('🔍 ParentMessages DEBUG - Conversations data:', { 
    conversations, 
    conversationsLength: conversations?.length,
    conversationsLoading, 
    conversationsError,
    hookEnabled: isAuthenticated
  });
  
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
    console.log('🔍 ParentMessages DEBUG - Filtering conversations:', { 
      conversationsLength: conversations.length, 
      filters,
      rawConversations: conversations 
    });
    
    if (!conversations.length) {
      console.log('🔍 ParentMessages DEBUG - No conversations to filter, returning empty array');
      return [];
    }
    
    const filtered = conversations.filter(conversation => {
      console.log('🔍 ParentMessages DEBUG - Checking conversation:', {
        id: conversation.id,
        advocate: conversation.advocate,
        advocateName: conversation.advocate?.name,
        advocateSpecialty: conversation.advocate?.specialty,
        archived: conversation.archived,
        status: conversation.status,
        priority: conversation.priority,
        fullConversation: conversation
      });
      
      // Filter by archive status
      if (filters.archived !== null) {
        if (filters.archived && !conversation.archived) {
          console.log('🔍 ParentMessages DEBUG - Filtered out: archived filter mismatch');
          return false;
        }
        if (!filters.archived && conversation.archived) {
          console.log('🔍 ParentMessages DEBUG - Filtered out: archived filter mismatch');
          return false;
        }
      }
      
      // Filter by status
      if (filters.status.length > 0) {
        if (!filters.status.includes(conversation.status || 'active')) {
          console.log('🔍 ParentMessages DEBUG - Filtered out: status filter mismatch');
          return false;
        }
      }
      
      // Filter by priority
      if (filters.priority.length > 0) {
        if (!filters.priority.includes(conversation.priority || 'normal')) {
          console.log('🔍 ParentMessages DEBUG - Filtered out: priority filter mismatch');
          return false;
        }
      }
      
      console.log('🔍 ParentMessages DEBUG - Conversation passed all filters');
      return true;
    });
    
    console.log('🔍 ParentMessages DEBUG - Final filtered conversations:', {
      filteredLength: filtered.length,
      filtered: filtered
    });
    
    return filtered;
  }, [conversations, filters]);
  
  // Authentication loading state
  if (authLoading) {
    return (
      <MobileAppShell>
        <SafeAreaFull>
          <PremiumMobileHeader title="Messages" />
          <ContainerMobile className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </ContainerMobile>
        </SafeAreaFull>
      </MobileAppShell>
    );
  }

  // Authentication required state
  if (!isAuthenticated || !user) {
    return (
      <MobileAppShell>
        <SafeAreaFull>
          <PremiumMobileHeader title="Messages" />
          <ContainerMobile className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Authentication Required</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You need to sign in to access your messages.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full" data-testid="button-sign-in">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full" data-testid="button-home">
                    <Link to="/">Go Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ContainerMobile>
        </SafeAreaFull>
      </MobileAppShell>
    );
  }

  // Auto-select first conversation when loaded - moved to useEffect to avoid setState-during-render
  useEffect(() => {
    if (isAuthenticated && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [isAuthenticated, conversations.length, selectedConversation]);
  
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

  // Mobile conversation selection handler
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setCurrentView('chat');
    if (conversation.unread_count > 0) {
      await markMessagesRead(conversation.id);
      refetchConversations();
    }
  };

  // Mobile back to conversations handler
  const handleBackToConversations = () => {
    setCurrentView('conversations');
    setSelectedConversation(null);
  };

  return (
    <MobileAppShell>
      <SafeAreaFull>
        {/* Mobile Header */}
        <PremiumMobileHeader
          title={currentView === 'conversations' ? 'Messages' : selectedConversation?.advocate.name}
          subtitle={currentView === 'chat' && selectedConversation ? selectedConversation.advocate.specialty : undefined}
          showBack={currentView === 'chat'}
          onBack={handleBackToConversations}
          rightAction={
            currentView === 'conversations' ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="button-search-toggle"
              >
                <Search className="h-5 w-5" />
              </Button>
            ) : selectedConversation ? (
              <ConversationActionsMenu conversation={selectedConversation} />
            ) : null
          }
          variant="elevated"
        />

        {/* Mobile Content */}
        <div className="flex-1 relative overflow-hidden">
          {/* Conversations List View */}
          <div className={cn(
            "absolute inset-0 transition-transform duration-300 ease-out",
            currentView === 'conversations' ? "translate-x-0" : "-translate-x-full"
          )}>
            <ContainerMobile className="h-full flex flex-col">
              {/* Search Bar */}
              {showSearch && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search conversations..." 
                      className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl"
                      data-testid="input-search-conversations"
                    />
                  </div>
                </div>
              )}
              
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="space-y-3 pt-4">
                    {/* 🐛 DEBUG: Show conversation mapping info */}
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 text-sm font-medium">✅ DEBUG: Conversations found!</p>
                      <p className="text-green-700 dark:text-green-300 text-xs mt-1">Filtered conversations: {filteredConversations.length}</p>
                      <p className="text-green-700 dark:text-green-300 text-xs">About to render PremiumConversationCard components...</p>
                    </div>
                    {(() => {
                      console.log('🔥 CONVERSATION MAPPING START:', {
                        filteredConversationsLength: filteredConversations.length,
                        conversations: filteredConversations.map(c => ({
                          id: c.id,
                          advocateName: c.advocate?.name,
                          hasAdvocate: !!c.advocate
                        }))
                      });
                      
                      return filteredConversations.map((conversation, index) => {
                        console.log(`🔥 MAPPING CONVERSATION ${index + 1}/${filteredConversations.length}:`, {
                          id: conversation.id,
                          conversation,
                          hasAdvocate: !!conversation.advocate,
                          advocateName: conversation.advocate?.name
                        });
                        
                        try {
                          return (
                            <div key={conversation.id} data-testid={`conversation-wrapper-${conversation.id}`}>
                              <PremiumConversationCard
                                conversation={conversation}
                                onClick={() => handleSelectConversation(conversation)}
                              />
                            </div>
                          );
                        } catch (error) {
                          console.error('❌ ERROR mapping conversation:', conversation.id, error);
                          return (
                            <div key={conversation.id} className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
                              <p className="text-red-800 dark:text-red-200 text-sm font-medium">⚠️ DEBUG: Mapping Error</p>
                              <p className="text-red-600 dark:text-red-400 text-xs mt-1">ID: {conversation.id}</p>
                              <p className="text-red-600 dark:text-red-400 text-xs">Error: {String(error)}</p>
                            </div>
                          );
                        }
                      });
                    })()
                    }
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No Conversations</p>
                      <p className="text-sm">Your conversations will appear here</p>
                      {/* TEMP DEBUG: Show debugging info in UI */}
                      <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded text-xs text-left max-w-md mx-auto">
                        <p><strong>DEBUG INFO:</strong></p>
                        <p>Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
                        <p>Loading: {conversationsLoading ? 'Yes' : 'No'}</p>
                        <p>Raw conversations: {conversations?.length || 0}</p>
                        <p>Filtered: {filteredConversations.length}</p>
                        <p>Error: {conversationsError || 'None'}</p>
                        <p>User: {user?.id || 'None'}</p>
                        <p>Token: {typeof window !== 'undefined' && localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ContainerMobile>
          </div>

          {/* Chat View */}
          <div className={cn(
            "absolute inset-0 transition-transform duration-300 ease-out",
            currentView === 'chat' ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="h-full flex flex-col">
              {selectedConversation && (
                <>
                  {/* Message Search */}
                  {messageHistory?.messages && messageHistory.messages.length > 0 && (
                    <div className="border-b border-gray-200 dark:border-gray-800">
                      <MessageSearch
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        currentResult={currentResultIndex}
                        totalResults={totalResults}
                        onNext={goToNext}
                        onPrevious={goToPrevious}
                        onClear={clearSearch}
                        placeholder="Search messages..."
                      />
                    </div>
                  )}
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
                  <ContainerMobile className="py-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : messageHistory?.messages && messageHistory.messages.length > 0 ? (
                      <div className="space-y-4">
                        {messageHistory.messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              message.sender_id === selectedConversation.parent_id ? 'justify-end' : 'justify-start'
                            )}
                            data-testid={`message-${message.id}`}
                            data-message-id={message.id}
                          >
                            <div className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                              message.sender_id === selectedConversation.parent_id
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-12"
                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-12"
                            )}>
                              {message.content && (
                                <div className="text-sm leading-relaxed mb-2">
                                  <MessageHighlight
                                    text={message.content}
                                    searchTerm={searchTerm}
                                    isCurrentResult={isCurrentResult(message.id)}
                                    className="break-words"
                                  />
                                </div>
                              )}
                              {(message as any).attachments && (message as any).attachments.length > 0 && (
                                <MessageAttachmentDisplay 
                                  attachments={(message as any).attachments as MessageAttachment[]} 
                                  compact={true}
                                />
                              )}
                              <div className={cn(
                                "text-xs mt-1 opacity-75",
                                message.sender_id === selectedConversation.parent_id
                                  ? "text-blue-100"
                                  : "text-gray-500 dark:text-gray-400"
                              )}>
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Messages Yet</p>
                          <p className="text-sm">Start a conversation with {selectedConversation.advocate.name}</p>
                        </div>
                      </div>
                    )}
                  </ContainerMobile>
                </div>
                {/* Message Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
                  {/* File Upload Section */}
                  {showFileUpload && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Attach Files</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowFileUpload(false);
                            setAttachmentFiles([]);
                          }}
                          className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                          data-testid="button-close-upload"
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
                  <ContainerMobile className="py-4">
                    <div className="flex items-end gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                        className={cn(
                          "h-11 w-11 rounded-full transition-all duration-200 active:scale-95",
                          showFileUpload 
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                        )}
                        data-testid="button-attach-files"
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      
                      <div className="flex-1 space-y-2">
                        <div className="relative">
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
                            className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl h-11 text-base px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                            data-testid="input-message"
                          />
                        </div>
                        {attachmentFiles.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                            {attachmentFiles.filter(f => f.status === 'completed').length} of {attachmentFiles.length} files ready
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        size="icon" 
                        disabled={sending || (!newMessageText.trim() && !attachmentFiles.some(f => f.status === 'completed'))}
                        onClick={handleSendMessage}
                        className={cn(
                          "h-11 w-11 rounded-full transition-all duration-200 active:scale-95",
                          "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                          "disabled:from-gray-300 disabled:to-gray-400 disabled:opacity-50",
                          "shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20"
                        )}
                        data-testid="button-send-message"
                      >
                        {sending ? (
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        ) : (
                          <Send className="h-5 w-5 text-white" />
                        )}
                      </Button>
                    </div>
                  </ContainerMobile>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SafeAreaFull>
    </MobileAppShell>
  );
}