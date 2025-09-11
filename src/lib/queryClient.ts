import { QueryClient } from '@tanstack/react-query';

const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const [url] = queryKey as [string, ...any[]];
  
  const response = await fetch(url, {
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
  // FORCE console output to always appear (using console.log for better visibility in Replit)
  console.log('🚨 APIQUEST DEBUG - URL:', url, 'METHOD:', method);
  
  // Get token with additional validation and better error handling
  const token = localStorage.getItem('authToken');
  console.log('🚨 APIQUEST TOKEN CHECK:', token ? `FOUND: ${token.substring(0,20)}...` : 'MISSING - No token in localStorage');
  
  // If no token, try to get fresh token from auth endpoint
  if (!token) {
    console.log('🚨 APIQUEST: No token found, attempting to retrieve from auth session...');
    try {
      const authResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        if (authData.authToken) {
          localStorage.setItem('authToken', authData.authToken);
          console.log('🚨 APIQUEST: Fresh token retrieved and stored');
        }
      }
    } catch (authError) {
      console.log('🚨 APIQUEST: Failed to get fresh token:', authError);
    }
  }
  
  // Re-check token after potential refresh
  const finalToken = localStorage.getItem('authToken');
  console.log('🚨 APIQUEST FINAL TOKEN:', finalToken ? `USING: ${finalToken.substring(0,20)}...` : 'STILL MISSING');
  
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
  
  // CRITICAL: Force add auth header if token exists
  if (finalToken && finalToken.trim().length > 0) {
    const authValue = `Bearer ${finalToken}`;
    finalHeaders.set('Authorization', authValue);
    console.log('🚨 APIQUEST AUTH HEADER SET:', `Bearer ${finalToken.substring(0,20)}...`);
  } else {
    console.log('🚨 APIQUEST AUTH MISSING - NO VALID TOKEN TO SEND');
  }
  
  // Debug final headers (without exposing full token)
  const headersObj: Record<string, string> = {};
  finalHeaders.forEach((value, key) => {
    headersObj[key] = key === 'Authorization' ? `Bearer ${value.substring(7, 27)}...` : value;
  });
  console.log('🚨 APIQUEST FINAL HEADERS:', JSON.stringify(headersObj));
  
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
      credentials: 'include',
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    console.log('🚨 APIQUEST MAKING FETCH CALL TO:', url);
    const response = await fetch(url, fetchOptions);
    
    console.log('🚨 APIQUEST RESPONSE STATUS:', response.status, 'for', url);
    
    if (!response.ok) {
      console.log('🚨 APIQUEST FAILED - STATUS:', response.status, 'TEXT:', response.statusText);
      
      if (response.status === 401) {
        console.log('🚨 APIQUEST 401 - CLEARING EXPIRED TOKEN');
        localStorage.removeItem('authToken');
        // Try to redirect to auth if this is an authentication failure
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          console.log('🚨 APIQUEST 401 - REDIRECTING TO AUTH');
          window.location.href = '/auth';
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
    }
    
    console.log('🚨 APIQUEST SUCCESS:', url);
    return response;
    
  } catch (error) {
    console.log('🚨 APIQUEST CATCH ERROR:', error);
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