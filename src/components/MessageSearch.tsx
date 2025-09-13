import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface MessageSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentResult: number;
  totalResults: number;
  onNext: () => void;
  onPrevious: () => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export function MessageSearch({
  searchTerm,
  onSearchChange,
  currentResult,
  totalResults,
  onNext,
  onPrevious,
  onClear,
  placeholder = "Search messages...",
  className = ""
}: MessageSearchProps) {
  const [inputValue, setInputValue] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearchChange(inputValue);
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputValue, onSearchChange]);

  // Update input value when searchTerm changes externally
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevious();
      } else {
        onNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClear();
    }
  }, [onNext, onPrevious, onClear]);

  const hasResults = totalResults > 0;
  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className={`flex items-center gap-2 p-3 bg-muted/20 border-b ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-8"
          data-testid="input-search-messages"
        />
        {hasSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            data-testid="button-clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {hasSearch && (
        <div className="flex items-center gap-2">
          {hasResults ? (
            <>
              <Badge variant="secondary" className="text-xs font-mono">
                {currentResult + 1} of {totalResults}
              </Badge>
              <div className="flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  disabled={totalResults === 0}
                  className="h-8 w-8 p-0"
                  title="Previous result (Shift+Enter)"
                  data-testid="button-previous-result"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={totalResults === 0}
                  className="h-8 w-8 p-0"
                  title="Next result (Enter)"
                  data-testid="button-next-result"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Badge variant="secondary" className="text-xs">
              No results
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}