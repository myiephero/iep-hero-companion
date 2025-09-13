import { useMemo } from 'react';

interface MessageHighlightProps {
  text: string;
  searchTerm: string;
  isCurrentResult?: boolean;
  className?: string;
}

export function MessageHighlight({ 
  text, 
  searchTerm, 
  isCurrentResult = false,
  className = "" 
}: MessageHighlightProps) {
  const highlightedText = useMemo(() => {
    if (!searchTerm.trim() || !text) {
      return text;
    }

    // Escape special regex characters in search term
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Split with capturing group - matches appear at odd indices (1, 3, 5...)
    const parts = text.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));
    
    return parts.map((part, index) => {
      // Use index-based detection: odd indices are matches from capturing group
      const isMatch = index % 2 === 1;
      
      if (isMatch) {
        return (
          <mark
            key={index}
            className={`px-1 py-0.5 rounded-sm font-medium ${
              isCurrentResult 
                ? 'bg-yellow-300 text-yellow-900 ring-2 ring-yellow-400' 
                : 'bg-yellow-200 text-yellow-800'
            }`}
            data-testid={isCurrentResult ? "highlight-current" : "highlight-match"}
          >
            {part}
          </mark>
        );
      }
      
      return part;
    });
  }, [text, searchTerm, isCurrentResult]);

  return (
    <span className={className}>
      {highlightedText}
    </span>
  );
}