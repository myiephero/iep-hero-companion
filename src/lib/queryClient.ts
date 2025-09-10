import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't always refetch on mount
    },
  },
});

// BULLETPROOF API request helper with guaranteed auth headers
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  options?: RequestInit
): Promise<Response> {
  // FORCE console output to always appear (using console.error to guarantee visibility)
  console.error('🚨 APIQUEST DEBUG - URL:', url, 'METHOD:', method);
  
  // Get token with additional validation
  const token = localStorage.getItem('authToken');
  console.error('🚨 APIQUEST TOKEN:', token ? `FOUND: ${token.substring(0,20)}...` : 'MISSING');
  
  // Build headers with guaranteed type safety
  const finalHeaders = new Headers();
  
  // Always add content type
  finalHeaders.set('Content-Type', 'application/json');
  
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
  
  // CRITICAL: Force add auth header if token exists
  if (token && token.trim().length > 0) {
    const authValue = `Bearer ${token}`;
    finalHeaders.set('Authorization', authValue);
    console.error('🚨 APIQUEST AUTH ADDED:', `Bearer ${token.substring(0,20)}...`);
  } else {
    console.error('🚨 APIQUEST AUTH MISSING - NO VALID TOKEN');
  }
  
  // Debug final headers
  const headersObj: Record<string, string> = {};
  finalHeaders.forEach((value, key) => {
    headersObj[key] = key === 'Authorization' ? `Bearer ${value.substring(7, 27)}...` : value;
  });
  console.error('🚨 APIQUEST FINAL HEADERS:', JSON.stringify(headersObj));
  
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
      credentials: 'include',
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    console.error('🚨 APIQUEST MAKING FETCH CALL...');
    const response = await fetch(url, fetchOptions);
    
    console.error('🚨 APIQUEST RESPONSE STATUS:', response.status, 'for', url);
    
    if (!response.ok) {
      console.error('🚨 APIQUEST FAILED - STATUS:', response.status, 'TEXT:', response.statusText);
      
      if (response.status === 401) {
        console.error('🚨 APIQUEST 401 - CLEARING TOKEN');
        localStorage.removeItem('authToken');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
    }
    
    console.error('🚨 APIQUEST SUCCESS:', url);
    return response;
    
  } catch (error) {
    console.error('🚨 APIQUEST CATCH ERROR:', error);
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