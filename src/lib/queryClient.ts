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

// API request helper with token support - FIXED: Always include auth header
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  options?: RequestInit
): Promise<Response> {
  const token = localStorage.getItem('authToken');
  console.log('🔍 apiRequest - Token from localStorage:', token ? `${token.substring(0,20)}...` : 'NULL');
  console.log('🔍 apiRequest - Making request to:', url, 'with method:', method);
  
  // CRITICAL FIX: Always build headers with proper auth
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  // ALWAYS include Authorization header if token exists (fix for missing headers)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ apiRequest - Authorization header added:', `Bearer ${token.substring(0,20)}...`);
  } else {
    console.log('⚠️ apiRequest - No auth token found in localStorage');
  }
  
  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include', // Always include for authenticated endpoints
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log('📡 apiRequest - Response status:', response.status, 'for', url);

  if (!response.ok && response.status === 401) {
    console.log('🚫 Token expired or invalid, clearing authToken');
    localStorage.removeItem('authToken');
    throw new Error(`${response.status}: ${response.statusText || 'Unauthorized'}`);
  }

  if (!response.ok) {
    console.log('❌ apiRequest - Request failed:', response.status, response.statusText);
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response;
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