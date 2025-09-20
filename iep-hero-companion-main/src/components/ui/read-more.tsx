import React, { useState, useCallback, useMemo } from 'react';
import { Button } from './button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadMoreTextProps {
  text: string;
  maxLength?: number;
  expandText?: string;
  collapseText?: string;
  className?: string;
  preserveFormatting?: boolean;
  showButtonIcon?: boolean;
  buttonClassName?: string;
  contentClassName?: string;
  truncateStrategy?: 'characters' | 'words';
  testId?: string;
}

export function ReadMoreText({
  text,
  maxLength = 200,
  expandText = 'Read more',
  collapseText = 'Read less',
  className,
  preserveFormatting = true,
  showButtonIcon = true,
  buttonClassName,
  contentClassName,
  truncateStrategy = 'characters',
  testId
}: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize truncated text calculation
  const { shouldTruncate, truncatedText, fullText } = useMemo(() => {
    if (!text || text.length === 0) {
      return { shouldTruncate: false, truncatedText: text, fullText: text };
    }

    let shouldTruncate: boolean;
    let truncatedText: string;

    if (truncateStrategy === 'words') {
      const words = text.split(/\s+/);
      shouldTruncate = words.length > maxLength;
      truncatedText = shouldTruncate 
        ? words.slice(0, maxLength).join(' ') + '...'
        : text;
    } else {
      shouldTruncate = text.length > maxLength;
      truncatedText = shouldTruncate 
        ? text.slice(0, maxLength).trimEnd() + '...'
        : text;
    }

    return {
      shouldTruncate,
      truncatedText,
      fullText: text
    };
  }, [text, maxLength, truncateStrategy]);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // If text doesn't need truncation, render as-is
  if (!shouldTruncate) {
    return (
      <div 
        className={cn(className)} 
        data-testid={testId ? `${testId}-content` : undefined}
      >
        <div 
          className={cn(
            preserveFormatting && 'whitespace-pre-wrap',
            contentClassName
          )}
        >
          {text}
        </div>
      </div>
    );
  }

  const displayText = isExpanded ? fullText : truncatedText;

  return (
    <div 
      className={cn(className)} 
      data-testid={testId}
    >
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out',
          preserveFormatting && 'whitespace-pre-wrap',
          contentClassName
        )}
        data-testid={testId ? `${testId}-content` : undefined}
      >
        {displayText}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={cn(
          'mt-2 p-0 h-auto font-normal text-primary hover:text-primary/80 transition-colors',
          buttonClassName
        )}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? `${collapseText} content` : `${expandText} content`}
        data-testid={testId ? `${testId}-toggle` : undefined}
      >
        <span className="flex items-center gap-1">
          {isExpanded ? collapseText : expandText}
          {showButtonIcon && (
            <span className="transition-transform duration-200">
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </span>
          )}
        </span>
      </Button>
    </div>
  );
}

// Utility hook for consistent read-more configuration
export function useReadMoreConfig(variant: 'compact' | 'standard' | 'detailed' = 'standard') {
  return useMemo(() => {
    switch (variant) {
      case 'compact':
        return {
          maxLength: 150,
          truncateStrategy: 'characters' as const,
          preserveFormatting: false
        };
      case 'detailed':
        return {
          maxLength: 500,
          truncateStrategy: 'characters' as const,
          preserveFormatting: true
        };
      case 'standard':
      default:
        return {
          maxLength: 200,
          truncateStrategy: 'characters' as const,
          preserveFormatting: true
        };
    }
  }, [variant]);
}

// Specialized components for common use cases
export function AIAnalysisReadMore({ 
  text, 
  className,
  testId = 'ai-analysis-read-more'
}: { 
  text: string; 
  className?: string;
  testId?: string;
}) {
  const config = useReadMoreConfig('detailed');
  
  return (
    <ReadMoreText
      text={text}
      {...config}
      className={cn('text-muted-foreground', className)}
      expandText="Show full analysis"
      collapseText="Show summary"
      testId={testId}
    />
  );
}

export function RecommendationReadMore({ 
  text, 
  className,
  testId = 'recommendation-read-more'
}: { 
  text: string; 
  className?: string;
  testId?: string;
}) {
  const config = useReadMoreConfig('standard');
  
  return (
    <ReadMoreText
      text={text}
      {...config}
      className={cn('text-muted-foreground', className)}
      expandText="Read full recommendation"
      collapseText="Show less"
      testId={testId}
    />
  );
}

export function MessageContentReadMore({ 
  text, 
  className,
  testId = 'message-read-more'
}: { 
  text: string; 
  className?: string;
  testId?: string;
}) {
  const config = useReadMoreConfig('compact');
  
  return (
    <ReadMoreText
      text={text}
      {...config}
      className={className}
      expandText="Show more"
      collapseText="Show less"
      showButtonIcon={false}
      testId={testId}
    />
  );
}