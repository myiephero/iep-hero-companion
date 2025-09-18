import { ArrowLeft, Phone, VideoIcon, MoreVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SafeAreaTop } from '@/components/mobile/SafeArea';
import { cn } from '@/lib/utils';

interface MobileMessageHeaderProps {
  // Navigation
  onBack: () => void;
  showBackButton?: boolean;
  
  // Contact info
  contactName: string;
  contactAvatar?: string;
  contactStatus?: string;
  lastSeen?: string;
  
  // Message info
  unreadCount?: number;
  isTyping?: boolean;
  
  // Actions
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onShowProfile?: () => void;
  
  // Styling
  className?: string;
}

export function MobileMessageHeader({
  onBack,
  showBackButton = true,
  contactName,
  contactAvatar,
  contactStatus,
  lastSeen,
  unreadCount = 0,
  isTyping = false,
  onCall,
  onVideoCall,
  onSearch,
  onShowProfile,
  className
}: MobileMessageHeaderProps) {
  
  const getStatusText = () => {
    if (isTyping) return "typing...";
    if (contactStatus === 'online') return "online";
    if (lastSeen) return `last seen ${new Date(lastSeen).toLocaleString()}`;
    return "";
  };

  const getStatusColor = () => {
    if (isTyping) return "text-primary";
    if (contactStatus === 'online') return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <SafeAreaTop className={cn("bg-background border-b", className)}>
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Left section - Back button and contact info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Back button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-10 w-10 p-0 flex-shrink-0"
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {/* Contact avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contactAvatar} alt={contactName} />
              <AvatarFallback className="text-sm font-medium">
                {contactName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            {/* Online status indicator */}
            {contactStatus === 'online' && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
            )}
            
            {/* Unread badge */}
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          
          {/* Contact info */}
          <div 
            className="flex-1 min-w-0 cursor-pointer" 
            onClick={onShowProfile}
            data-testid="contact-info"
          >
            <h2 className="font-semibold text-foreground truncate text-base leading-tight">
              {contactName}
            </h2>
            {(isTyping || contactStatus || lastSeen) && (
              <p className={cn(
                "text-sm truncate leading-tight",
                getStatusColor(),
                isTyping && "animate-pulse"
              )}>
                {getStatusText()}
              </p>
            )}
          </div>
        </div>

        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Video call button */}
          {onVideoCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onVideoCall}
              className="h-10 w-10 p-0"
              data-testid="video-call-button"
            >
              <VideoIcon className="h-5 w-5" />
            </Button>
          )}
          
          {/* Voice call button */}
          {onCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCall}
              className="h-10 w-10 p-0"
              data-testid="voice-call-button"
            >
              <Phone className="h-5 w-5" />
            </Button>
          )}
          
          {/* Search button */}
          {onSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearch}
              className="h-10 w-10 p-0"
              data-testid="search-button"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* More options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0"
                data-testid="more-options-button"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onShowProfile && (
                <>
                  <DropdownMenuItem onClick={onShowProfile} data-testid="view-profile">
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem data-testid="mute-notifications">
                Mute Notifications
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="clear-chat">
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="block-contact" className="text-destructive">
                Block Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </SafeAreaTop>
  );
}