import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { offlineStorage } from './lib/offlineStorage'
import { Capacitor } from '@capacitor/core'

// 🔒 CRITICAL iOS SAFARI FIX: Comprehensive navigation control
const originalWindowOpen = window.open;
const originalLocationAssign = window.location.assign;
const originalLocationReplace = window.location.replace;

// Override window.open to prevent external browser
window.open = function(url?: string | URL, target?: string, features?: string) {
  if (!url) return originalWindowOpen.call(this, url, target, features);
  
  const urlStr = url.toString();
  console.log('🔒 window.open intercepted:', urlStr, 'target:', target, 'features:', features);
  
  // Keep ALL internal URLs in WebView - NO EXCEPTIONS
  if (urlStr === '' || urlStr.startsWith('/') || urlStr.startsWith(window.location.origin) || urlStr.startsWith('http://localhost') || urlStr.startsWith('https://localhost') || urlStr.includes('replit.dev')) {
    console.log('🔒 STAYING IN WEBVIEW - redirecting internally');
    window.location.replace(urlStr || '/');
    return null;
  }
  
  console.log('🔒 ALLOWING external window.open for:', urlStr);
  return originalWindowOpen.call(this, url, target, features);
};

// Debug navigation events
window.addEventListener('beforeunload', (e) => {
  console.log('🔒 beforeunload triggered:', window.location.href);
});

window.addEventListener('unload', (e) => {
  console.log('🔒 unload triggered:', window.location.href);
});

// Intercept all link clicks to prevent target="_blank" Safari redirects
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const link = target.closest('a') as HTMLAnchorElement | null;
  
  if (link && link.href) {
    console.log('🔒 Link clicked:', link.href, 'target:', link.target);
    
    if (link.target === '_blank' && (link.origin === window.location.origin || link.href.startsWith('/') || link.href.includes('replit.dev'))) {
      e.preventDefault();
      console.log('🔒 Intercepted target="_blank" link - staying in WebView');
      window.location.replace(link.href);
    }
  }
});

// Note: Cannot override location.assign/replace as they are readonly in iOS WebView

// 🚀 NATIVE APP FIX: Only register Service Worker for web builds, NOT native apps
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
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
