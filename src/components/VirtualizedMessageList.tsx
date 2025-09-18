import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Loader2, MessageSquare, RotateCcw, AlertCircle, Clock, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageHighlight } from '@/components/MessageHighlight';
import { MessageAttachmentDisplay, type MessageAttachment } from '@/components/MessageAttachmentDisplay';
import { cn } from '@/lib/utils';

export interface OptimisticMessage {
  id: string;
  content: string;
  sender_type: 'parent' | 'advocate';
  created_at: string;
  attachments?: MessageAttachment[];
  // Optimistic fields
  sending?: boolean;
  failed?: boolean;
  delivered?: boolean;
}

interface VirtualizedMessageListProps {
  messages: OptimisticMessage[];
  currentUser: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
  otherUser?: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
  loading?: boolean;
  hasActiveSearch?: boolean;
  searchTerm?: string;
  isCurrentResult?: (message: OptimisticMessage) => boolean;
  onRetryMessage?: (messageId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

// Skeleton placeholder component
function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 py-2`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col space-y-2`}>
        <div className={`${
          isOwn 
            ? 'bg-primary/20 animate-pulse' 
            : 'bg-muted animate-pulse'
        } rounded-lg p-3 space-y-2`}>
          <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-24"></div>
          <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-40"></div>
          <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-32"></div>
        </div>
      </div>
    </div>
  );
}

// Message status indicator
function MessageStatus({ message }: { message: OptimisticMessage }) {
  if (message.sender_type !== 'parent') return null;
  
  if (message.sending) {
    return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
  }
  
  if (message.failed) {
    return <AlertCircle className="h-3 w-3 text-destructive" />;
  }
  
  if (message.delivered) {
    return <CheckCheck className="h-3 w-3 text-blue-500" />;
  }
  
  return <Check className="h-3 w-3 text-muted-foreground" />;
}

// Individual message component
function MessageItem({ 
  message, 
  currentUser, 
  otherUser, 
  hasActiveSearch, 
  searchTerm, 
  isCurrentResult, 
  onRetryMessage 
}: {
  message: OptimisticMessage;
  currentUser: VirtualizedMessageListProps['currentUser'];
  otherUser: VirtualizedMessageListProps['otherUser'];
  hasActiveSearch?: boolean;
  searchTerm?: string;
  isCurrentResult?: (message: OptimisticMessage) => boolean;
  onRetryMessage?: (messageId: string) => void;
}) {
  const isOwn = message.sender_type === 'parent';
  
  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 py-2 group`}
      data-message-id={message.id}
    >
      <div className={`max-w-[85%] sm:max-w-[70%] flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 ${isOwn ? 'space-x-reverse' : ''}`}>
        {!isOwn && (
          <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
            <AvatarImage src={otherUser?.avatar_url} alt={otherUser?.name || 'Other user'} />
            <AvatarFallback className="text-xs">
              {otherUser?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex flex-col space-y-1 flex-1 min-w-0">
          <div 
            className={cn(
              "relative rounded-2xl px-4 py-2 transition-all duration-200 max-w-full",
              isOwn 
                ? "bg-primary text-primary-foreground rounded-br-md" 
                : "bg-muted text-foreground rounded-bl-md",
              message.sending && "opacity-70",
              message.failed && "bg-destructive/10 border border-destructive/20"
            )}
          >
            {/* Message content */}
            <div className="break-words whitespace-pre-wrap">
              {hasActiveSearch && searchTerm ? (
                <MessageHighlight
                  text={message.content}
                  searchTerm={searchTerm}
                  isCurrentResult={isCurrentResult?.(message) || false}
                />
              ) : (
                <span>{message.content}</span>
              )}
            </div>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <MessageAttachmentDisplay 
                    key={index}
                    attachments={[attachment]}
                  />
                ))}
              </div>
            )}
            
            {/* Message metadata */}
            <div className={cn(
              "flex items-center justify-between mt-1 text-xs opacity-70 space-x-2",
              isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
            )}>
              <span className="whitespace-nowrap">
                {new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              <MessageStatus message={message} />
            </div>
            
            {/* Retry button for failed messages */}
            {message.failed && isOwn && onRetryMessage && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-8 right-0 text-xs h-6 px-2 bg-background border shadow-sm"
                onClick={() => onRetryMessage(message.id)}
                data-testid={`retry-message-${message.id}`}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VirtualizedMessageList({
  messages,
  currentUser,
  otherUser,
  loading = false,
  hasActiveSearch = false,
  searchTerm = '',
  isCurrentResult,
  onRetryMessage,
  onLoadMore,
  hasMore = false,
  className
}: VirtualizedMessageListProps) {
  const virtuosoRef = useRef<any>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrolledToBottom && virtuosoRef.current && messages.length > 0) {
      // Scroll to bottom smoothly using programmatic scroll
      virtuosoRef.current.scrollToIndex({
        index: messages.length - 1,
        behavior: 'smooth'
      });
    }
  }, [messages.length, scrolledToBottom]);

  // Handle scroll state changes
  const handleAtBottomStateChange = useCallback((atBottom: boolean) => {
    setScrolledToBottom(atBottom);
  }, []);

  // Render message item for Virtuoso
  const itemRenderer = useCallback((index: number) => {
    const message = messages[index];
    
    if (!message) {
      return <MessageSkeleton key={`skeleton-${index}`} />;
    }

    return (
      <MessageItem
        key={message.id}
        message={message}
        currentUser={currentUser}
        otherUser={otherUser}
        hasActiveSearch={hasActiveSearch}
        searchTerm={searchTerm}
        isCurrentResult={isCurrentResult}
        onRetryMessage={onRetryMessage}
      />
    );
  }, [messages, currentUser, otherUser, hasActiveSearch, searchTerm, isCurrentResult, onRetryMessage]);

  // Loading state
  if (loading && messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" data-testid="loading-messages" />
      </div>
    );
  }

  // Empty state
  if (!loading && messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center text-muted-foreground", className)} data-testid="empty-messages">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col relative", className)}>
      {/* Virtualized message list with Virtuoso */}
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        totalCount={messages.length}
        itemContent={itemRenderer}
        followOutput="smooth"
        atBottomStateChange={handleAtBottomStateChange}
        startReached={hasMore && !loading ? onLoadMore : undefined}
        className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent message-list-container"
        data-testid="virtualized-message-list"
        style={{ height: '100%' }}
        components={{
          Header: hasMore && loading ? () => (
            <div className="flex justify-center py-2" data-testid="loading-more-messages">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading more messages...</span>
            </div>
          ) : undefined
        }}
      />
      
      {/* Scroll to bottom button */}
      {!scrolledToBottom && messages.length > 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 rounded-full shadow-lg z-10 h-11 w-11 p-0"
          onClick={() => {
            virtuosoRef.current?.scrollToIndex({
              index: messages.length - 1,
              behavior: 'smooth'
            });
            setScrolledToBottom(true);
          }}
          data-testid="scroll-to-bottom-button"
        >
          ↓
        </Button>
      )}
    </div>
  );
}