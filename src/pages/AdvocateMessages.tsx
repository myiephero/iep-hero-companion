import { 
  MobileAppShell,
  PremiumElevatedHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MessageSquare, Loader2, FileText, Clock, Users, X, Archive, ArchiveRestore, AlertTriangle, ChevronUp, MoreHorizontal, ArrowLeft, Sparkles } from "lucide-react";
import { ConversationCards } from "@/components/ConversationCards";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useConversations, useMessages, useSendMessage, useCreateConversation, useProposalContacts } from "@/hooks/useMessaging";
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
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Conversation } from "@/lib/messaging";
import { cn } from "@/lib/utils";

// Professional message templates for different scenarios
const MESSAGE_TEMPLATES = {
  introduction: {
    title: 'Professional Introduction',
    icon: Users,
    template: (studentName: string, context: string) => 
      `Hello! Thank you for considering me as an advocate for ${studentName}${context}. I received your match proposal and I'm excited about the opportunity to support your family.

I'd love to learn more about ${studentName}'s specific needs, current IEP goals, and how I can best advocate for their educational success. Would you be available for a brief introductory call this week to discuss your priorities and next steps?

I look forward to hearing from you and hopefully working together to ensure ${studentName} receives the support they deserve.

Best regards,
Professional Advocate`
  },
  urgent_response: {
    title: 'Urgent Support Response',
    icon: Clock,
    template: (studentName: string, context: string) => 
      `Hello! I received your match proposal for ${studentName}${context} and understand there may be urgent advocacy needs.

I specialize in expedited IEP support and can typically begin advocacy services within 24-48 hours. I'm immediately available for an emergency consultation to discuss ${studentName}'s situation and develop an action plan.

Please let me know your availability for a priority call today or tomorrow. Time is critical, and I'm committed to ensuring ${studentName} receives the support they need without delay.

Urgent regards,
Professional Advocate`
  },
  detailed_inquiry: {
    title: 'Comprehensive Assessment',
    icon: FileText,
    template: (studentName: string, context: string) => 
      `Hello! Thank you for your interest in advocacy services for ${studentName}${context}. I'm honored to be considered for this important role.

To provide the most effective advocacy support, I'd like to understand:
• ${studentName}'s current IEP goals and any areas of concern
• Recent evaluation results or upcoming assessments
• Specific challenges you've encountered with the school district
• Your primary advocacy priorities and timeline

I offer a complimentary 30-minute consultation to review ${studentName}'s educational profile and discuss how I can best support your family's advocacy goals. Would you prefer a phone or video call this week?

Professionally yours,
Professional Advocate`
  }
};

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

export default function AdvocateMessages() {
  // Authentication check
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<MessageFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  
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
  const { contacts: proposalContacts, loading: contactsLoading, error: contactsError, refetch: refetchContacts } = useProposalContacts(isAuthenticated);
  const { messageHistory, loading: messagesLoading, refetch: refetchMessages } = useMessages(selectedConversation?.id || null, isAuthenticated);
  const { send: sendMessage, sending } = useSendMessage();
  const { create: createConversation, creating } = useCreateConversation();
  
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
      
      // Filter by labels (would need to fetch conversation labels - simplified for now)
      // This would require additional API calls or including labels in conversations response
      
      return true;
    });
  }, [conversations, filters]);
  
  // Handle URL query parameters for direct parent-specific conversations
  useEffect(() => {
    if (conversations.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const parentParam = searchParams.get('parent');
      const studentParam = searchParams.get('student');
      
      if (parentParam && studentParam) {
        // Find conversation with matching parent and student
        const targetConversation = conversations.find(conv => 
          conv.parent_id === parentParam && conv.student_id === studentParam
        );
        
        if (targetConversation && selectedConversation?.id !== targetConversation.id) {
          setSelectedConversation(targetConversation);
        }
      }
    }
  }, [conversations, location.search, selectedConversation?.id]);

  // Handle creating a new conversation from match proposal
  useEffect(() => {
    if (location.state?.newMessage && !creating) {
      const { advocateId, studentId, studentName, proposalId, studentGrade, studentSchool } = location.state.newMessage;
      
      // Build context for template personalization
      const gradeText = studentGrade ? ` (currently in grade ${studentGrade}` : '';
      const schoolText = studentSchool ? ` at ${studentSchool}` : '';
      const contextText = gradeText || schoolText ? `${gradeText}${schoolText}${gradeText ? ')' : ''}` : '';
      
      // Show template selector for new conversations
      setShowTemplateSelector(true);
      
      // Pre-populate with introduction template by default
      const displayName = studentName || 'your child';
      const introTemplate = MESSAGE_TEMPLATES.introduction.template(displayName, contextText);
      setNewMessageText(introTemplate);
      setSelectedTemplate('introduction');
      
      // Create a new conversation
      const parentId = location.state.newMessage.parentId;
      if (parentId) {
        createConversation(advocateId, studentId, parentId).then((conversation) => {
        if (conversation) {
          setSelectedConversation(conversation);
          refetchConversations(); // Refresh the conversations list
        }
        });
      }
    }
  }, [location.state, createConversation, creating, refetchConversations]);
  
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
  
  // Function to apply a template
  const applyTemplate = (templateKey: string) => {
    if (location.state?.newMessage) {
      const { studentName, studentGrade, studentSchool } = location.state.newMessage;
      const gradeText = studentGrade ? ` (currently in grade ${studentGrade}` : '';
      const schoolText = studentSchool ? ` at ${studentSchool}` : '';
      const contextText = gradeText || schoolText ? `${gradeText}${schoolText}${gradeText ? ')' : ''}` : '';
      
      const template = MESSAGE_TEMPLATES[templateKey as keyof typeof MESSAGE_TEMPLATES];
      if (template) {
        const displayName = studentName || 'your child';
        setNewMessageText(template.template(displayName, contextText));
        setSelectedTemplate(templateKey);
      }
    }
  };

  // Handle starting conversation from proposal contact
  const handleStartConversationFromProposal = async (contact: any) => {
    try {
      // Create a new conversation for this proposal contact
      const result = await createConversation(
        contact.proposal.advocate_id,
        contact.proposal.student_id,
        contact.proposal.parent_id
      );

      if (result) {
        // Refresh conversations list and select the new one
        await refetchConversations();
        setSelectedConversation(result);
        
        // Auto-fill with a professional introduction template
        const studentName = contact.student?.full_name || 'your child';
        const template = MESSAGE_TEMPLATES.introduction.template(studentName, '');
        setNewMessageText(template);
        setSelectedTemplate('introduction');
        setShowTemplateSelector(true);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Could add toast notification here for error handling
    }
  };

  // Handle sending message with optional attachments
  const handleSendMessage = async () => {
    if (!selectedConversation || sending) return;
    
    const hasContent = newMessageText.trim();
    const hasAttachments = attachmentFiles.some(f => f.status === 'completed' && f.documentId);
    
    if (!hasContent && !hasAttachments) return;

    // Check if any files are still uploading
    const hasUploadingFiles = attachmentFiles.some(f => f.status === 'uploading');
    if (hasUploadingFiles) {
      console.warn('Some files are still uploading. Please wait for uploads to complete.');
      return;
    }

    // Prepare attachment document IDs (no longer using base64)
    const documentIds = attachmentFiles
      .filter(f => f.status === 'completed' && f.documentId)
      .map(f => f.documentId!);

    try {
      const message = await sendMessage(
        selectedConversation.id, 
        newMessageText.trim() || undefined,
        documentIds.length > 0 ? documentIds : undefined
      );
      
      if (message) {
        // Clear form
        setNewMessageText('');
        setAttachmentFiles([]);
        setShowFileUpload(false);
        setSelectedTemplate(null);
        setShowTemplateSelector(false);
        
        // Refresh data
        refetchMessages();
        refetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Error handling could be improved with toast notifications
    }
  };

  // Handle conversation selection for mobile navigation
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
  };

  // Authentication loading state
  if (authLoading) {
    return (
      <MobileAppShell showBottomNav={true}>
        <SafeAreaFull>
          <PremiumElevatedHeader title="Messages" />
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
      <MobileAppShell showBottomNav={true}>
        <SafeAreaFull>
          <PremiumElevatedHeader title="Messages" />
          <ContainerMobile className="flex items-center justify-center min-h-[400px]">
            <PremiumCard variant="elevated" className="max-w-md mx-auto p-6">
              <div className="text-center space-y-6">
                <MessageSquare className="h-12 w-12 mx-auto text-primary" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Authentication Required</h3>
                  <p className="text-muted-foreground">
                    You need to sign in to access advocate messaging.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button asChild className="w-full" data-testid="button-sign-in">
                    <a href="/auth">Sign In</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full" data-testid="button-home">
                    <a href="/">Go Home</a>
                  </Button>
                </div>
              </div>
            </PremiumCard>
          </ContainerMobile>
        </SafeAreaFull>
      </MobileAppShell>
    );
  }

  return (
    <MobileAppShell showBottomNav={true}>
      <SafeAreaFull>
        {/* Premium Mobile Header */}
        <PremiumElevatedHeader
          title={selectedConversation && !showConversationList ? 
            `${selectedConversation.student?.full_name || 'Student'}'s Family` : 
            'Messages'
          }
          subtitle={selectedConversation && !showConversationList ? 
            `Advocate: ${selectedConversation.advocate?.name || 'Unknown'}` : 
            `${filteredConversations.length} conversation${filteredConversations.length !== 1 ? 's' : ''}`
          }
          showBack={selectedConversation && !showConversationList}
          onBack={handleBackToConversations}
          rightAction={selectedConversation && !showConversationList && (
            <div className="flex items-center gap-2">
              <ConversationLabelSelector 
                conversationId={selectedConversation.id}
                onLabelsChanged={() => {
                  refetchConversations();
                }}
              />
              <ConversationActionsMenu conversation={selectedConversation} />
            </div>
          )}
        />

        <ContainerMobile className="flex-1 overflow-hidden">
          {/* Conversations List View */}
          {showConversationList && (
            <div className="h-full flex flex-col">
              {/* Search Bar */}
              <PremiumCard variant="glass" className="p-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-12 h-12 text-base bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm" 
                  />
                </div>
              </PremiumCard>

              {/* Conversation Management */}
              <PremiumCard variant="elevated" className="p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <ConversationLabelManager />
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950 rounded-full">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {filteredConversations.length}
                    </span>
                  </div>
                </div>
                <ConversationFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  conversationCount={filteredConversations.length}
                />
              </PremiumCard>

              {/* Loading State */}
              {conversationsLoading ? (
                <PremiumCard variant="glass" className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="text-base text-gray-600 dark:text-gray-400">Loading conversations...</span>
                    </div>
                  </div>
                </PremiumCard>
              ) : conversationsError ? (
                <PremiumCard variant="elevated" className="p-6">
                  <div className="text-center text-red-500">
                    Error loading conversations: {conversationsError}
                  </div>
                </PremiumCard>
              ) : (
                <>
                  {/* Existing Conversations */}
                  {filteredConversations.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Active Conversations
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {filteredConversations.map((conversation) => (
                          <PremiumCard
                            key={conversation.id}
                            variant="interactive"
                            onClick={() => handleConversationSelect(conversation)}
                            className={cn(
                              "p-4 transition-all duration-200",
                              selectedConversation?.id === conversation.id && "ring-2 ring-blue-500 dark:ring-blue-400"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src="/placeholder-1.jpg" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                                  {conversation.student?.full_name 
                                    ? conversation.student.full_name.split(' ').map(n => n[0]).join('') 
                                    : 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {conversation.student?.full_name 
                                      ? `${conversation.student.full_name}'s Family` 
                                      : "Student's Family"}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    {conversation.archived && (
                                      <Badge variant="secondary" className="text-xs px-2 py-1">
                                        <Archive className="w-3 h-3 mr-1" />
                                        Archived
                                      </Badge>
                                    )}
                                    {conversation.priority === 'urgent' && (
                                      <Badge variant="destructive" className="text-xs px-2 py-1">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {conversation.last_message_at 
                                      ? new Date(conversation.last_message_at).toLocaleDateString()
                                      : 'No messages yet'
                                    }
                                  </p>
                                  <ConversationLabelsDisplay conversationId={conversation.id} />
                                </div>
                              </div>
                            </div>
                          </PremiumCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proposal Contacts (New Contacts) */}
                  {proposalContacts && proposalContacts.filter(contact => !contact.hasConversation).length > 0 && (
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-2 px-2">
                        <div className="h-1 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          New Contacts
                        </h3>
                        <Badge variant="secondary" className="ml-auto">
                          {proposalContacts.filter(contact => !contact.hasConversation).length} new
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {proposalContacts.filter(contact => !contact.hasConversation).map((contact) => {
                          const studentName = contact.student?.full_name || 'Unknown Student';
                          const avatar = studentName.split(' ').map(n => n[0]).join('');
                          const statusText = contact.contactType === 'inactive' ? 'Pending proposal' : 'Accepted proposal';
                          
                          return (
                            <PremiumCard
                              key={contact.proposal.id}
                              variant="interactive"
                              onClick={() => handleStartConversationFromProposal(contact)}
                              className="p-4 bg-gradient-to-r from-green-50/50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50"
                              data-testid={`proposal-contact-${contact.proposal.id}`}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12 ring-2 ring-green-200 dark:ring-green-800">
                                  <AvatarImage src="/placeholder-new.jpg" />
                                  <AvatarFallback className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 text-green-600 dark:text-green-400 font-semibold">
                                    {avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                                      {studentName}'s Family
                                    </p>
                                    <Badge 
                                      variant={contact.contactType === 'inactive' ? 'secondary' : 'outline'} 
                                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                                    >
                                      {contact.contactType === 'inactive' ? 'New' : 'Ready'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{statusText}</p>
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                      Click to start messaging
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </PremiumCard>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No Results State */}
                  {filteredConversations.length === 0 && conversations.length > 0 && (
                    <PremiumCard variant="glass" className="p-8">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No matches found</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your filter criteria</p>
                      </div>
                    </PremiumCard>
                  )}
                  
                  {/* Empty State */}
                  {conversations.length === 0 && (!proposalContacts || proposalContacts.length === 0) && (
                    <PremiumCard variant="glass" className="p-8">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-3xl flex items-center justify-center">
                          <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Conversations Yet</p>
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                          Your client messages will appear here once you start receiving communications.
                        </p>
                      </div>
                    </PremiumCard>
                  )}
                </>
              )}
            </div>
          )}

          {/* Chat Interface View */}
          {selectedConversation && !showConversationList && (
            <div className="h-full flex flex-col">
              
              {/* Message Search */}
              {messageHistory?.messages && messageHistory.messages.length > 0 && (
                <div className="mb-4">
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
                </div>
              )}
              
              {/* Messages Container */}
              <PremiumCard variant="glass" className="flex-1 p-4 overflow-hidden">
                <div 
                  className="h-full overflow-y-auto space-y-4 scroll-smooth" 
                  ref={messagesContainerRef}
                >
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                        <span className="text-base text-gray-600 dark:text-gray-400">Loading messages...</span>
                      </div>
                    </div>
                  ) : messageHistory?.messages && messageHistory.messages.length > 0 ? (
                    messageHistory.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === selectedConversation.advocate_id ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.id}`}
                        data-message-id={message.id}
                      >
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-2xl shadow-sm transition-all duration-200",
                          message.sender_id === selectedConversation.advocate_id 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-12' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-12'
                        )}>
                          {message.content && (
                            <p className="text-sm leading-relaxed">
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
                          <span className={cn(
                            "text-xs block mt-2",
                            message.sender_id === selectedConversation.advocate_id 
                              ? "text-blue-100" 
                              : "text-gray-500 dark:text-gray-400"
                          )}>
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
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Messages Yet</p>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          Start a conversation with {selectedConversation.student?.full_name || 'the student'}'s family
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </PremiumCard>

              {/* Template Selector & Message Input */}
              <div className="mt-4 space-y-4">
                {/* Template Selector - Only show for new conversations from proposals */}
                {showTemplateSelector && location.state?.newMessage && (
                  <PremiumCard variant="glass" className="p-4">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Professional Templates</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose a template to personalize your response</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => {
                        const Icon = template.icon;
                        const isSelected = selectedTemplate === key;
                        return (
                          <Button
                            key={key}
                            variant="ghost"
                            onClick={() => applyTemplate(key)}
                            className={cn(
                              "h-auto p-4 justify-start text-left transition-all duration-200",
                              isSelected 
                                ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800" 
                                : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            )}
                            data-testid={`template-${key}`}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                isSelected 
                                  ? "bg-blue-500 text-white" 
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              )}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className={cn(
                                  "font-semibold",
                                  isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
                                )}>
                                  {template.title}
                                </p>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTemplateSelector(false)}
                        className="mt-2 self-end text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Hide Templates
                      </Button>
                    </div>
                  </PremiumCard>
                )}
                
                {/* File Upload Section */}
                {showFileUpload && (
                  <PremiumCard variant="elevated" className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl flex items-center justify-center">
                          <Paperclip className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Attach Files</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowFileUpload(false);
                          setAttachmentFiles([]);
                        }}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                  </PremiumCard>
                )}

                {/* Message Input */}
                <PremiumCard variant="elevated" className="p-4">
                  <div className="flex items-end gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className={cn(
                        "h-12 w-12 rounded-xl transition-all duration-200 mb-1",
                        showFileUpload 
                          ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                      data-testid="button-attach-files"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 space-y-2">
                      <textarea 
                        placeholder="Type your message..." 
                        className="w-full min-h-[80px] max-h-[200px] p-4 text-base border border-gray-200 dark:border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 transition-all duration-200"
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
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {attachmentFiles.filter(f => f.status === 'completed').length} of {attachmentFiles.length} files ready
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="default" 
                      disabled={sending || (!newMessageText.trim() && !attachmentFiles.some(f => f.status === 'completed'))}
                      onClick={handleSendMessage}
                      data-testid="button-send-message"
                      className={cn(
                        "h-12 w-12 rounded-xl mb-1 transition-all duration-200",
                        (newMessageText.trim() || attachmentFiles.some(f => f.status === 'completed')) && !sending
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                          : ""
                      )}
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                  
                  {/* Template hint for new conversations */}
                  {!showTemplateSelector && location.state?.newMessage && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 border-dashed">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTemplateSelector(true)}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Show Professional Templates
                      </Button>
                    </div>
                  )}
                </PremiumCard>
              </div>
            </div>
          )}
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}