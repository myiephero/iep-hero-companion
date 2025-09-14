import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MessageSquare, Loader2, FileText, Clock, Users, X, Archive, ArchiveRestore, AlertTriangle, ChevronUp, MoreHorizontal } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Conversation } from "@/lib/messaging";

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
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
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
  const { contacts: proposalContacts, loading: contactsLoading, error: contactsError, refetch: refetchContacts } = useProposalContacts();
  const { messageHistory, loading: messagesLoading, refetch: refetchMessages } = useMessages(selectedConversation?.id || null);
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
      const introTemplate = MESSAGE_TEMPLATES.introduction.template(studentName, contextText);
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
        setNewMessageText(template.template(studentName, contextText));
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
              ) : (
                <>
                  {/* Conversation Management Controls */}
                  <div className="p-4 border-b bg-muted/5">
                    <div className="flex items-center justify-between mb-3">
                      <ConversationLabelManager />
                      <div className="text-sm text-muted-foreground">
                        {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <ConversationFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      conversationCount={filteredConversations.length}
                    />
                  </div>
                  
                  {/* Existing Conversations */}
                  {filteredConversations.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-muted/20 border-b">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Conversations</h3>
                      </div>
                      {filteredConversations.map((conversation) => {
                        const studentName = conversation.student?.full_name || 'Student';
                        const avatar = studentName.split(' ').map(n => n[0]).join('');
                        const lastMessageTime = conversation.latest_message?.created_at ? 
                          new Date(conversation.latest_message.created_at).toLocaleDateString() : 'New';
                          
                        return (
                          <div
                            key={conversation.id}
                            className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                              selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                            }`}
                            onClick={() => setSelectedConversation(conversation)}
                            data-testid={`conversation-${conversation.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={`/placeholder-${conversation.id}.jpg`} />
                                <AvatarFallback>{avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">{conversation.parent?.name || 'Parent'}</p>
                                    {conversation.archived && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Archive className="w-3 h-3 mr-1" />
                                        Archived
                                      </Badge>
                                    )}
                                    {conversation.priority === 'urgent' && (
                                      <Badge variant="destructive" className="text-xs">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Urgent
                                      </Badge>
                                    )}
                                    {conversation.priority === 'high' && (
                                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                        <ChevronUp className="w-3 h-3 mr-1" />
                                        High
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
                                    <ConversationActionsMenu conversation={conversation} />
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{studentName}</p>
                                {conversation.latest_message?.content && (
                                  <p className="text-sm truncate">
                                    {conversation.latest_message.content}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {conversation.unread_count > 0 && (
                                    <Badge variant="default" className="text-xs">
                                      {conversation.unread_count} new
                                    </Badge>
                                  )}
                                  <ConversationLabelsDisplay conversationId={conversation.id} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Proposal Contacts (New Contacts) */}
                  {proposalContacts && proposalContacts.filter(contact => !contact.hasConversation).length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-muted/20 border-b">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Contacts (Incoming Proposals)</h3>
                      </div>
                      {proposalContacts.filter(contact => !contact.hasConversation).map((contact) => {
                        const studentName = contact.student?.full_name || 'Unknown Student';
                        const avatar = studentName.split(' ').map(n => n[0]).join('');
                        const statusText = contact.contactType === 'inactive' ? 'Pending proposal' : 'Accepted proposal';
                        
                        return (
                          <div
                            key={contact.proposal.id}
                            className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleStartConversationFromProposal(contact)}
                            data-testid={`proposal-contact-${contact.proposal.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src="/placeholder-new.jpg" />
                                <AvatarFallback>{avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium truncate">{studentName}'s Family</p>
                                  <Badge variant={contact.contactType === 'inactive' ? 'secondary' : 'outline'} className="text-xs">
                                    {contact.contactType === 'inactive' ? 'New' : 'Ready'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{statusText}</p>
                                <p className="text-sm text-green-600">
                                  Click to start messaging
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* No Results State */}
                  {filteredConversations.length === 0 && conversations.length > 0 && (
                    <div className="flex items-center justify-center h-32 p-8">
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium mb-1">No conversations match your filters</p>
                        <p className="text-xs">Try adjusting your filter criteria</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Empty State */}
                  {conversations.length === 0 && (!proposalContacts || proposalContacts.length === 0) && (
                    <div className="flex items-center justify-center h-full p-8">
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No Conversations Yet</p>
                        <p className="text-sm">Your client messages will appear here once you start receiving communications.</p>
                      </div>
                    </div>
                  )}
                </>
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
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-1.jpg" />
                      <AvatarFallback>
                        {selectedConversation?.student?.full_name 
                          ? selectedConversation.student.full_name.split(' ').map(n => n[0]).join('') 
                          : 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {selectedConversation?.student?.full_name 
                            ? `${selectedConversation.student.full_name}'s Family` 
                            : "Student's Family"}
                        </p>
                        {selectedConversation.archived && (
                          <Badge variant="secondary" className="text-xs">
                            <Archive className="w-3 h-3 mr-1" />
                            Archived
                          </Badge>
                        )}
                        {selectedConversation.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                        {selectedConversation.priority === 'high' && (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                            <ChevronUp className="w-3 h-3 mr-1" />
                            High
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Advocate: {selectedConversation?.advocate?.name || 'Unknown Advocate'}
                        </p>
                        <ConversationLabelsDisplay conversationId={selectedConversation.id} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversation Management Controls */}
                  <div className="flex items-center gap-2">
                    <ConversationLabelSelector 
                      conversationId={selectedConversation.id}
                      onLabelsChanged={() => {
                        // Refresh conversations to update label display
                        refetchConversations();
                      }}
                    />
                    <ConversationActionsMenu conversation={selectedConversation} />
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
                      className={`flex ${message.sender_id === selectedConversation.advocate_id ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${message.id}`}
                      data-message-id={message.id}
                    >
                      <div className={`max-w-lg p-3 rounded-lg ${
                        message.sender_id === selectedConversation.advocate_id 
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
                      <p className="text-sm">Start a conversation with {selectedConversation.student?.full_name || 'the student'}'s family</p>
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
                {/* Template Selector - Only show for new conversations from proposals */}
                {showTemplateSelector && location.state?.newMessage && (
                  <div className="p-4 bg-muted/30 border-b">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Professional Templates</h4>
                      <p className="text-xs text-muted-foreground">Choose a template to personalize your response</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => {
                        const Icon = template.icon;
                        return (
                          <Button
                            key={key}
                            variant={selectedTemplate === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => applyTemplate(key)}
                            className="flex items-center gap-2"
                            data-testid={`template-${key}`}
                          >
                            <Icon className="h-3 w-3" />
                            {template.title}
                          </Button>
                        );
                      })}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTemplateSelector(false)}
                        className="ml-auto text-muted-foreground"
                      >
                        Hide Templates
                      </Button>
                    </div>
                  </div>
                )}
                
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
                      className={`mb-1 ${showFileUpload ? 'bg-muted' : ''}`}
                      data-testid="button-attach-files"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 space-y-2">
                      <textarea 
                        placeholder="Type your message..." 
                        className="w-full min-h-[60px] max-h-[200px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
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
                      className="mb-1"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Template hint for new conversations */}
                  {!showTemplateSelector && location.state?.newMessage && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTemplateSelector(true)}
                        className="text-xs text-muted-foreground"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Show Professional Templates
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}