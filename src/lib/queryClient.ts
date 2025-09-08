import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always refetch for fresh data
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true, // Refetch when window gets focus
      refetchOnMount: true, // Always refetch on component mount
    },
  },
});

// API request helper with token support
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  options?: RequestInit
): Promise<Response> {
  const token = localStorage.getItem('authToken');
  console.log('🔧 DEBUG apiRequest: Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL/UNDEFINED');
  console.log('🔧 DEBUG apiRequest: Making request to:', url);
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options?.headers || {}),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok && response.status === 401) {
    // Token expired or invalid, clear it
    localStorage.removeItem('authToken');
    throw new Error(`${response.status}: ${response.statusText || 'Unauthorized'}`);
  }

  if (!response.ok) {
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