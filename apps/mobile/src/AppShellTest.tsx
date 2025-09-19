// 🚀 iOS WEBVIEW DEBUGGING: Progressive complexity testing
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

// 🔧 FEATURE FLAGS - Toggle each layer to isolate the crash
const ENABLE_ROUTER = true;
const ENABLE_QUERY_CLIENT = true;
const ENABLE_TOOLTIP_PROVIDER = true;
const ENABLE_TOASTER = true;
const ENABLE_AUTH_PROVIDER = false;
const ENABLE_PUSH_NOTIFICATIONS = false;

// Simple safe component that always works
function SafePage() {
  console.log('🔧 SafePage rendering...');
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🧪 Shell Test Phase</h1>
      <p>✅ Router: {ENABLE_ROUTER ? 'ON' : 'OFF'}</p>
      <p>✅ QueryClient: {ENABLE_QUERY_CLIENT ? 'ON' : 'OFF'}</p>
      <p>✅ TooltipProvider: {ENABLE_TOOLTIP_PROVIDER ? 'ON' : 'OFF'}</p>
      <p>✅ Toaster: {ENABLE_TOASTER ? 'ON' : 'OFF'}</p>
      <p>✅ AuthProvider: {ENABLE_AUTH_PROVIDER ? 'ON' : 'OFF'}</p>
      <p>✅ PushNotifications: {ENABLE_PUSH_NOTIFICATIONS ? 'ON' : 'OFF'}</p>
      <p>If you see this, current configuration works!</p>
    </div>
  );
}

// Query client for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false, // Disable retries for testing
    },
  },
});

function AppShellTest() {
  console.log('🔧 AppShellTest starting...');
  
  // 🚀 PHASE 1: Router Testing
  if (ENABLE_ROUTER) {
    console.log('🔧 Testing with Router...');
    return (
      <BrowserRouter basename="/m">
        <AppWithProviders />
      </BrowserRouter>
    );
  }
  
  return <AppWithProviders />;
}

function AppWithProviders() {
  console.log('🔧 AppWithProviders rendering...');
  
  let content = <SafePage />;
  
  // 🚀 PHASE 2: Add providers progressively
  if (ENABLE_TOASTER) {
    console.log('🔧 Adding Toaster...');
    content = (
      <>
        {content}
        <Toaster />
      </>
    );
  }
  
  if (ENABLE_TOOLTIP_PROVIDER) {
    console.log('🔧 Adding TooltipProvider...');
    content = (
      <TooltipProvider>
        {content}
      </TooltipProvider>
    );
  }
  
  if (ENABLE_QUERY_CLIENT) {
    console.log('🔧 Adding QueryClientProvider...');
    content = (
      <QueryClientProvider client={queryClient}>
        {content}
      </QueryClientProvider>
    );
  }
  
  // 🚀 TODO: Add AuthProvider and PushNotificationProvider testing
  // when we get to those phases
  
  return content;
}

export default AppShellTest;