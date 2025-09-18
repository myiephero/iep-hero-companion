import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { cancelRequest } from '@/lib/queryClient';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string | (string | number | boolean)[];
  debounceMs?: number;
  enableOfflineCache?: boolean;
  backgroundRefresh?: boolean;
  requestKey?: string;
}

export function useOptimizedQuery<T = unknown>(
  options: OptimizedQueryOptions<T>
) {
  const {
    queryKey,
    debounceMs = 0,
    enableOfflineCache = true,
    backgroundRefresh = false,
    requestKey,
    ...queryOptions
  } = options;

  const queryClient = useQueryClient();
  const mountedRef = useRef(true);
  
  // Debounce the query key for search/filter scenarios
  const debouncedQueryKey = useDebounce(queryKey, debounceMs);
  
  // Generate a stable key for request cancellation
  const stableRequestKey = requestKey || (Array.isArray(debouncedQueryKey) 
    ? debouncedQueryKey.join('-') 
    : String(debouncedQueryKey));

  const query = useQuery({
    queryKey: Array.isArray(debouncedQueryKey) ? debouncedQueryKey : [debouncedQueryKey],
    ...queryOptions,
    // Enhanced stale time based on connection
    staleTime: (() => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType;
        
        // Longer stale time for slower connections
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            return 10 * 60 * 1000; // 10 minutes
          case '3g':
            return 5 * 60 * 1000; // 5 minutes
          default:
            return queryOptions.staleTime || 2 * 60 * 1000; // 2 minutes
        }
      }
      return queryOptions.staleTime || 2 * 60 * 1000;
    })(),
    // Network mode optimization
    networkMode: enableOfflineCache ? 'offlineFirst' : 'online',
  });

  // Background refresh for critical data
  useEffect(() => {
    if (!backgroundRefresh || !query.data) return;

    const interval = setInterval(() => {
      if (mountedRef.current && document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ 
          queryKey: Array.isArray(debouncedQueryKey) ? debouncedQueryKey : [debouncedQueryKey] 
        });
      }
    }, 30000); // Refresh every 30 seconds when visible

    return () => clearInterval(interval);
  }, [backgroundRefresh, query.data, queryClient, debouncedQueryKey]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any pending requests
      cancelRequest(stableRequestKey);
    };
  }, [stableRequestKey]);

  // Optimized invalidation function
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: Array.isArray(debouncedQueryKey) ? debouncedQueryKey : [debouncedQueryKey] 
    });
  }, [queryClient, debouncedQueryKey]);

  // Prefetch related data
  const prefetchRelated = useCallback((relatedKeys: (string | (string | number | boolean)[])[]) => {
    relatedKeys.forEach(key => {
      queryClient.prefetchQuery({
        queryKey: Array.isArray(key) ? key : [key],
        staleTime: 60000, // 1 minute stale time for prefetch
      });
    });
  }, [queryClient]);

  return {
    ...query,
    invalidate,
    prefetchRelated,
    isStale: query.isStale,
    isFetchedAfterMount: query.isFetchedAfterMount,
  };
}

// Hook for optimized mutations with better error handling
export function useOptimizedMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    invalidateQueries?: (string | (string | number | boolean)[])[];
    optimisticUpdate?: (variables: TVariables) => void;
    requestKey?: string;
  }
) {
  const queryClient = useQueryClient();
  const { invalidateQueries = [], optimisticUpdate, requestKey, ...mutationOptions } = options || {};

  const mutation = {
    mutationFn: async (variables: TVariables) => {
      // Cancel existing request if needed
      if (requestKey) {
        cancelRequest(requestKey);
      }
      
      // Apply optimistic update
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }
      
      return mutationFn(variables);
    },
    onSuccess: (data: TData, variables: TVariables) => {
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ 
          queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] 
        });
      });
      
      mutationOptions.onSuccess?.(data, variables);
    },
    onError: (error: TError, variables: TVariables) => {
      // Revert optimistic updates on error
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ 
          queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] 
        });
      });
      
      mutationOptions.onError?.(error, variables);
    },
  };

  return mutation;
}