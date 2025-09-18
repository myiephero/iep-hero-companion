import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageFileUpload, type MessageFile } from '@/components/MessageFileUpload';
import { SafeAreaBottom } from '@/components/mobile/SafeArea';

interface AutoGrowingComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachmentsChange: (files: MessageFile[]) => void;
  attachments: MessageFile[];
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  className?: string;
  // Keyboard handling
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
  // iOS-specific handling
  adjustForKeyboard?: boolean;
}

const MIN_HEIGHT = 44; // Minimum touch target size
const MAX_HEIGHT = 144; // About 6 lines
const LINE_HEIGHT = 24; // Approximate line height

export function AutoGrowingComposer({
  value,
  onChange,
  onSend,
  onAttachmentsChange,
  attachments,
  sending = false,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 2000,
  showCharacterCount = false,
  className,
  onKeyboardShow,
  onKeyboardHide,
  adjustForKeyboard = true
}: AutoGrowingComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [textareaHeight, setTextareaHeight] = useState(MIN_HEIGHT);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get accurate scrollHeight
    textarea.style.height = `${MIN_HEIGHT}px`;
    
    // Calculate new height based on content
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  }, []);

  // Adjust height when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  // iOS keyboard detection and handling
  useEffect(() => {
    if (!adjustForKeyboard || typeof window === 'undefined') return;

    let initialViewportHeight = window.innerHeight;
    let keyboardShowTimeout: number;
    let keyboardHideTimeout: number;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Clear existing timeouts
      clearTimeout(keyboardShowTimeout);
      clearTimeout(keyboardHideTimeout);
      
      if (heightDifference > 150) {
        // Keyboard likely visible
        keyboardShowTimeout = setTimeout(() => {
          setIsKeyboardVisible(true);
          setKeyboardHeight(heightDifference);
          onKeyboardShow?.();
          
          // Scroll to keep composer in view
          if (composerRef.current) {
            setTimeout(() => {
              composerRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
              });
            }, 100);
          }
        }, 100) as number;
      } else {
        // Keyboard likely hidden
        keyboardHideTimeout = setTimeout(() => {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
          onKeyboardHide?.();
        }, 100) as number;
      }
    };

    const handleFocus = () => {
      // Force a resize check when textarea gets focus
      setTimeout(handleResize, 300);
    };

    // Visual viewport API support for modern browsers
    if ('visualViewport' in window && window.visualViewport) {
      const visualViewport = window.visualViewport;
      visualViewport.addEventListener('resize', handleResize);
      const currentTextarea = textareaRef.current;
      currentTextarea?.addEventListener('focus', handleFocus);
      
      return () => {
        visualViewport.removeEventListener('resize', handleResize);
        currentTextarea?.removeEventListener('focus', handleFocus);
      };
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize);
      const currentTextarea = textareaRef.current;
      currentTextarea?.addEventListener('focus', handleFocus);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        currentTextarea?.removeEventListener('focus', handleFocus);
      };
    }
  }, [adjustForKeyboard, onKeyboardShow, onKeyboardHide]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || attachments.some(f => f.status === 'completed')) {
        onSend();
      }
    }
  }, [value, attachments, onSend]);

  const handleSend = useCallback(() => {
    if (disabled || sending) return;
    if (value.trim() || attachments.some(f => f.status === 'completed')) {
      onSend();
    }
  }, [disabled, sending, value, attachments, onSend]);

  const toggleAttachments = useCallback(() => {
    setShowAttachments(!showAttachments);
  }, [showAttachments]);

  const charactersUsed = value.length;
  const charactersRemaining = maxLength - charactersUsed;
  const showWarning = charactersUsed > maxLength * 0.8;

  return (
    <SafeAreaBottom className={cn("bg-background border-t", className)}>
      <div 
        ref={composerRef}
        className={cn(
          "transition-all duration-200 ease-out",
          isKeyboardVisible && adjustForKeyboard && "pb-2"
        )}
        style={{
          // Adjust positioning when keyboard is visible
          transform: isKeyboardVisible && adjustForKeyboard 
            ? `translateY(-${Math.min(keyboardHeight / 4, 50)}px)` 
            : 'none'
        }}
      >
        {/* File attachment area */}
        {showAttachments && (
          <div className="border-b bg-muted/30 p-4 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Attachments</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachments(false)}
                className="h-6 w-6 p-0"
                data-testid="close-attachments"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <MessageFileUpload
              files={attachments}
              onFilesChange={onAttachmentsChange}
            />
          </div>
        )}

        {/* Composer input area */}
        <div className="p-4 space-y-3">
          <div className="flex items-end space-x-3">
            {/* Attachment button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAttachments}
              disabled={disabled}
              className={cn(
                "h-11 w-11 p-0 flex-shrink-0 transition-colors",
                showAttachments && "bg-primary text-primary-foreground"
              )}
              data-testid="attach-files-button"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            {/* Text input area */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                className={cn(
                  "w-full resize-none rounded-2xl px-4 py-3 pr-12",
                  "border border-input bg-background text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "transition-all duration-200 ease-out",
                  "text-base", // Prevent zoom on iOS
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{ 
                  minHeight: MIN_HEIGHT,
                  height: textareaHeight,
                  lineHeight: `${LINE_HEIGHT}px`
                }}
                data-testid="message-textarea"
              />
              
              {/* Character count */}
              {showCharacterCount && (
                <div 
                  className={cn(
                    "absolute bottom-1 right-1 text-xs px-2 py-1 rounded",
                    "bg-background/80 backdrop-blur-sm",
                    showWarning && charactersRemaining >= 0 && "text-orange-500",
                    charactersRemaining < 0 && "text-destructive",
                    "transition-colors duration-200"
                  )}
                >
                  {charactersRemaining < 100 && `${charactersRemaining}`}
                </div>
              )}
            </div>

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={disabled || sending || (!value.trim() && !attachments.some(f => f.status === 'completed'))}
              className={cn(
                "h-11 w-11 p-0 rounded-full flex-shrink-0",
                "transition-all duration-200 ease-out",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              data-testid="send-message-button"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm",
                    "bg-muted border transition-colors duration-200",
                    file.status === 'completed' && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
                    file.status === 'error' && "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  )}
                >
                  <Paperclip className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{file.file.name}</span>
                  {file.status === 'uploading' && (
                    <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAttachmentsChange(attachments.filter((_, i) => i !== index))}
                    className="h-4 w-4 p-0 flex-shrink-0 hover:bg-transparent"
                    data-testid={`remove-attachment-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SafeAreaBottom>
  );
}