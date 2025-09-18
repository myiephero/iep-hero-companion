import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Archive, 
  ArchiveRestore, 
  AlertTriangle, 
  ChevronUp, 
  MoreHorizontal, 
  Clock,
  User,
  Loader2
} from "lucide-react";
import type { Conversation } from "@/lib/messaging";
import { useUpdateConversationStatus } from "@/hooks/useConversationLabels";
import { useToast } from "@/hooks/use-toast";

interface ConversationCardsProps {
  conversations: Conversation[];
  loading?: boolean;
  onOpenConversation?: (conversation: Conversation) => void;
  onArchive?: (conversation: Conversation) => void;
  onMarkUrgent?: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

// Individual Conversation Card Component
function ConversationCard({ 
  conversation, 
  isSelected,
  onOpenConversation,
}: { 
  conversation: Conversation;
  isSelected?: boolean;
  onOpenConversation?: (conversation: Conversation) => void;
}) {
  const { updateStatus } = useUpdateConversationStatus();
  const { toast } = useToast();

  const participantName = conversation.advocate?.name || conversation.parent?.name || 'Unknown';
  const studentName = conversation.student?.name || 'No student';
  const latestMessage = conversation.latest_message?.content || 'No messages yet';
  const latestMessageDate = conversation.latest_message?.created_at 
    ? new Date(conversation.latest_message.created_at).toLocaleDateString()
    : '';

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

  const getPriorityBadge = () => {
    switch (conversation.priority) {
      case 'urgent':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Urgent
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
            <ChevronUp className="w-3 h-3 mr-1" />
            High
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="secondary" className="text-xs">
            <ChevronUp className="w-3 h-3 mr-1 rotate-180 text-gray-500" />
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'hover:border-primary/20'
      }`}
      onClick={() => onOpenConversation?.(conversation)}
      data-testid={`conversation-card-${conversation.id}`}
    >
      <div className="p-4">
        {/* Header with participant info and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src="/placeholder-1.jpg" />
              <AvatarFallback className="text-base font-medium">
                {participantName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold truncate" data-testid={`conversation-participant-${conversation.id}`}>
                  {participantName}
                </h3>
                {conversation.unread_count > 0 && (
                  <Badge variant="destructive" className="text-xs px-2 py-1 min-w-0">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{studentName}</span>
              </div>
            </div>
          </div>
          
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 shrink-0" 
                data-testid={`conversation-menu-${conversation.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleArchiveToggle();
              }} data-testid={`conversation-${conversation.archived ? 'unarchive' : 'archive'}-${conversation.id}`}>
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
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handlePriorityChange('urgent');
              }} data-testid={`conversation-priority-urgent-${conversation.id}`}>
                <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                Mark as Urgent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handlePriorityChange('high');
              }} data-testid={`conversation-priority-high-${conversation.id}`}>
                <ChevronUp className="mr-2 h-4 w-4 text-orange-500" />
                Mark as High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handlePriorityChange('normal');
              }} data-testid={`conversation-priority-normal-${conversation.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Mark as Normal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handlePriorityChange('low');
              }} data-testid={`conversation-priority-low-${conversation.id}`}>
                <ChevronUp className="mr-2 h-4 w-4 text-gray-500 rotate-180" />
                Mark as Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Latest message */}
        <div className="mb-3">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`conversation-message-${conversation.id}`}>
            {latestMessage}
          </p>
        </div>

        {/* Footer with badges and timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <Badge 
              variant={conversation.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {conversation.status}
            </Badge>
            
            {/* Priority badge */}
            {getPriorityBadge()}
            
            {/* Archived badge */}
            {conversation.archived && (
              <Badge variant="secondary" className="text-xs">
                <Archive className="w-3 h-3 mr-1" />
                Archived
              </Badge>
            )}
          </div>
          
          {/* Timestamp */}
          {latestMessageDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              <span>{latestMessageDate}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Main ConversationCards component
export function ConversationCards({ 
  conversations, 
  loading, 
  onOpenConversation,
  selectedConversationId
}: ConversationCardsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading conversations...</span>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium mb-2">No conversations found</p>
          <p className="text-sm">Your client messages will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2" data-testid="conversation-cards-container">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversationId === conversation.id}
          onOpenConversation={onOpenConversation}
        />
      ))}
    </div>
  );
}