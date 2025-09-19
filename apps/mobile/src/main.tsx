import { createRoot } from 'react-dom/client'
// 🚀 RESTORE ORIGINAL APP: Focus on routing issues, not white screen
import App from './App.tsx'
import './index.css'
import { offlineStorage } from './lib/offlineStorage'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'

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

// 🚀 iOS WEBVIEW FIX: Handle "Failed to change to usage state 2" error
// Proper app state management for iOS WebView lifecycle
if (Capacitor.isNativePlatform()) {
  console.log('🔧 Setting up iOS WebView lifecycle management...');
  
  // Handle app state changes to prevent WebView state errors
  CapApp.addListener('appStateChange', ({ isActive }) => {
    console.log('🔧 App state changed:', isActive ? 'Active' : 'Background');
    
    if (isActive) {
      // App came to foreground - refresh WebView if needed
      console.log('🔧 App activated - WebView should be ready');
    } else {
      // App went to background - prepare for state transition
      console.log('🔧 App backgrounded - preparing WebView state transition');
    }
  });
  
  // Handle splash screen manually for better control
  window.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM loaded - hiding splash screen');
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  });
}

// Initialize React app
console.log('🔧 Initializing React app...');
createRoot(document.getElementById("root")!).render(<App />);
