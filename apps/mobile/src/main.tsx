import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { offlineStorage } from './lib/offlineStorage'
import { Capacitor } from '@capacitor/core'

// 🔒 CRITICAL iOS SAFARI FIX: Foolproof Capacitor Patch
const originalWindowOpen = window.open;

window.open = function(url?: string | URL, target?: string, features?: string) {
  const urlStr = url?.toString() || '';
  console.log('[window.open] URL:', urlStr, 'Target:', target);

  const isInternal = urlStr === '' ||
                     urlStr.startsWith('/') ||
                     urlStr.startsWith(window.location.origin) ||
                     urlStr.startsWith('myiephero://');

  if (isInternal) {
    console.log('[WebView] Internal navigation detected:', urlStr);
    window.location.href = urlStr || '/';
    return null;
  }

  console.warn('[External URL] Blocked:', urlStr);
  return null;
};

// Intercept anchor clicks
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A') {
    const anchor = target as HTMLAnchorElement;
    const href = anchor.href;
    if (href) {
      const isInternal = href.startsWith(window.location.origin) || href.startsWith('myiephero://');
      if (isInternal) {
        e.preventDefault();
        console.log('[Anchor Click] Internal navigation:', href);
        window.location.href = href;
      } else {
        e.preventDefault();
        console.warn('[Anchor Click] External URL blocked:', href);
      }
    }
  }
});

// Log fetch/XHR requests and detect redirects
(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo, init?: RequestInit) {
    const response = await originalFetch(input, init);
    console.log('[Fetch] URL:', input, 'Status:', response.status, 'Redirected:', response.redirected);
    return response;
  };

  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string) {
    console.log('[XHR] Open:', method, url);
    return originalXHROpen.apply(this, arguments as any);
  };
})();

// 🚀 NATIVE APP FIX: Only register Service Worker for web builds, NOT native apps
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/m/sw.js', { scope: '/m/' })
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('🔄 New service worker available');
                
                // Optionally show update notification
                if (window.confirm('A new version is available. Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log(`🔄 Background sync completed: ${event.data.syncedCount} operations synced`);
        
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('offline-sync-complete', {
          detail: { syncedCount: event.data.syncedCount }
        }));
      }
    });

    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        if ('sync' in registration) {
          return (registration as any).sync.register('offline-sync');
        }
      }).catch((error) => {
        console.warn('⚠️ Background sync not supported:', error);
      });
    }
  });
} else if (Capacitor.isNativePlatform()) {
  // 🧹 NUCLEAR CACHE CLEAR: Unregister any existing Service Workers for native apps
  console.log('🧹 Native app detected - clearing any existing Service Worker cache');
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        console.log('🗑️ Unregistering Service Worker:', registration.scope);
        registration.unregister();
      });
    });
  }
  
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        console.log('🗑️ Deleting cache:', cacheName);
        caches.delete(cacheName);
      });
    });
  }
}

// Initialize offline storage
offlineStorage.initialize().then((success) => {
  if (success) {
    console.log('✅ Offline storage initialized successfully');
    
    // Schedule periodic cleanup
    setInterval(() => {
      offlineStorage.cleanupOldData().catch(console.error);
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  } else {
    console.warn('⚠️ Offline storage initialization failed');
  }
});

// Listen for app visibility changes to sync when app becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && navigator.onLine) {
    // App became visible and we're online - trigger sync
    window.dispatchEvent(new CustomEvent('app-visible-online'));
  }
});

createRoot(document.getElementById("root")!).render(<App />);
