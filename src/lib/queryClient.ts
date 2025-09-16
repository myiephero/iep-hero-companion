import { QueryClient } from '@tanstack/react-query';
import { resolveApiUrl } from './apiConfig';

// Safe logging utility that respects production environment
const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

function debugLog(message: string, ...args: any[]) {
  if (isDevelopment) {
    console.log(message, ...args);
  }
}

function debugWarn(message: string, ...args: any[]) {
  if (isDevelopment) {
    console.warn(message, ...args);
  }
}

const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const [url] = queryKey as [string, ...any[]];
  const resolvedUrl = resolveApiUrl(url);
  
  const response = await fetch(resolvedUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't always refetch on mount
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408 (timeout)
        if (error?.message?.includes('40') && !error?.message?.includes('408')) {
          return false;
        }
        // Retry up to 2 times for network issues
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Enhanced API request with request cancellation
const requestCache = new Map<string, AbortController>();

export function cancelRequest(key: string) {
  const controller = requestCache.get(key);
  if (controller) {
    controller.abort();
    requestCache.delete(key);
  }
}

// Secure API request helper with production-safe logging and cancellation
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  options?: RequestInit & { requestKey?: string }
): Promise<Response> {
  debugLog('API Request:', method, url);
  
  // Get token with validation
  const token = localStorage.getItem('authToken');
  debugLog('Token status:', token ? 'FOUND' : 'MISSING');
  
  // 🔧 TOKEN-ONLY AUTH: No token means user is not authenticated
  if (!token) {
    debugLog('❌ No auth token found - user must login');
  }
  
  // Use the token we have (no refresh attempt)
  const finalToken = token;
  debugLog('Final token status:', finalToken ? 'AVAILABLE' : 'MISSING');
  
  // Build headers with guaranteed type safety
  const finalHeaders = new Headers();
  
  // Always add content type for POST/PUT requests
  if (method === 'POST' || method === 'PUT') {
    finalHeaders.set('Content-Type', 'application/json');
  }
  
  // Add any existing headers from options
  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => finalHeaders.set(key, value));
    } else if (typeof options.headers === 'object') {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value !== undefined) finalHeaders.set(key, String(value));
      });
    }
  }
  
  // Add auth header if token exists
  if (finalToken && finalToken.trim().length > 0) {
    const authValue = `Bearer ${finalToken}`;
    finalHeaders.set('Authorization', authValue);
    debugLog('Authorization header set');
  } else {
    debugWarn('No valid authentication token available');
  }
  
  // Debug headers without exposing sensitive data
  if (isDevelopment) {
    const sanitizedHeaders: Record<string, string> = {};
    finalHeaders.forEach((value, key) => {
      sanitizedHeaders[key] = key === 'Authorization' ? '[REDACTED]' : value;
    });
    debugLog('Request headers:', sanitizedHeaders);
  }
  
  try {
    // Handle request cancellation
    const requestKey = options?.requestKey || `${method}-${url}`;
    
    // Cancel any existing request with the same key
    cancelRequest(requestKey);
    
    // Create new abort controller
    const abortController = new AbortController();
    requestCache.set(requestKey, abortController);
    
    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
      credentials: 'include',
      signal: abortController.signal,
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const resolvedUrl = resolveApiUrl(url);
    debugLog('Making request to resolved URL');
    const response = await fetch(resolvedUrl, fetchOptions);
    
    // Clean up successful request
    requestCache.delete(requestKey);
    
    debugLog('Response status:', response.status, 'for', url);
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText, 'for', url);
      
      if (response.status === 401) {
        debugLog('Authentication failed - clearing expired token');
        localStorage.removeItem('authToken');
        // Try to redirect to auth if this is an authentication failure
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          debugLog('Redirecting to authentication page');
          window.location.href = '/auth';
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
    }
    
    debugLog('API request successful for:', url);
    return response;
    
  } catch (error) {
    console.error('API request error for', url, ':', error.message);
    throw error;
  }
}

export const getQueryFn = (options?: { on401?: 'returnNull' | 'throw' }) => {
  return async ({ queryKey }: { queryKey: [string, ...any[]] }) => {
    try {
      const response = await apiRequest('GET', queryKey[0]);
      return await response.json();
    } catch (error: any) {
      if (error.message.includes('401') && options?.on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
};