import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Message } from '@/lib/messaging';

export interface SearchResult {
  message: Message;
  index: number;
}

export function useMessageSearch(messages: Message[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Find all messages that match the search term
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchTerm.trim() || !messages.length) {
      return [];
    }

    const trimmedTerm = searchTerm.trim().toLowerCase();
    return messages
      .map((message, index) => ({ message, index }))
      .filter(({ message }) => 
        message.content && 
        message.content.toLowerCase().includes(trimmedTerm)
      );
  }, [messages, searchTerm]);

  // Get filtered messages (for display purposes)
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) {
      return messages;
    }
    return searchResults.map(result => result.message);
  }, [messages, searchResults, searchTerm]);

  // Get current search result message
  const currentSearchResult = useMemo(() => {
    if (searchResults.length === 0) return null;
    return searchResults[currentResultIndex] || null;
  }, [searchResults, currentResultIndex]);

  // Reset current result when search term changes
  useEffect(() => {
    setCurrentResultIndex(0);
  }, [searchTerm]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
  }, [searchResults.length]);

  const goToPrevious = useCallback(() => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex((prev) => 
      prev === 0 ? searchResults.length - 1 : prev - 1
    );
  }, [searchResults.length]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentResultIndex(0);
  }, []);

  // Helper to check if a message is the current search result
  const isCurrentResult = useCallback((messageId: string) => {
    if (!currentSearchResult) return false;
    return currentSearchResult.message.id === messageId;
  }, [currentSearchResult]);

  // Helper to check if a message has search matches
  const hasSearchMatch = useCallback((messageId: string) => {
    if (!searchTerm.trim()) return false;
    return searchResults.some(result => result.message.id === messageId);
  }, [searchResults, searchTerm]);

  return {
    // State
    searchTerm,
    currentResultIndex,
    
    // Results
    searchResults,
    filteredMessages,
    currentSearchResult,
    
    // Counts
    totalResults: searchResults.length,
    
    // Actions
    setSearchTerm,
    goToNext,
    goToPrevious,
    clearSearch,
    
    // Helpers
    isCurrentResult,
    hasSearchMatch,
    
    // Computed
    hasActiveSearch: searchTerm.trim().length > 0,
    hasResults: searchResults.length > 0
  };
}