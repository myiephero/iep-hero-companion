import { createRoot } from 'react-dom/client'
// 🚀 iOS WEBVIEW SYSTEMATIC TESTING: Progressive complexity testing
import AppShellTest from './AppShellTest.tsx'
// import AppMinimal from './AppMinimal.tsx'
// import App from './App.tsx'
import './index.css'
import { offlineStorage } from './lib/offlineStorage'
import { Capacitor } from '@capacitor/core'

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

// 🚀 iOS WEBVIEW DEBUGGING: Add global error handling
console.log('🔧 Mobile app starting...');

// Global error catching for iOS WebView debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: red; color: white; padding: 10px; z-index: 9999;">
      <h3>🚨 JavaScript Error Detected</h3>
      <p><strong>Message:</strong> ${event.message}</p>
      <p><strong>File:</strong> ${event.filename}:${event.lineno}</p>
      <p><strong>Error:</strong> ${event.error}</p>
    </div>
  `;
  document.body.appendChild(errorDiv);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: orange; color: white; padding: 10px; z-index: 9999;">
      <h3>🚨 Promise Rejection Detected</h3>
      <p><strong>Reason:</strong> ${event.reason}</p>
    </div>
  `;
  document.body.appendChild(errorDiv);
});

// Debug React mounting
try {
  console.log('🔧 Attempting to render React app...');
  const root = document.getElementById("root");
  console.log('🔧 Root element found:', !!root);
  
  if (!root) {
    throw new Error('Root element not found');
  }
  
  createRoot(root).render(<AppShellTest />);
  console.log('🔧 React app rendered successfully!');
} catch (error) {
  console.error('🚨 Critical error rendering React app:', error);
  // Fallback: Show basic HTML content
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: Arial;">
        <h1>🚨 React Crash Detected</h1>
        <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>This helps us debug the iOS WebView issue.</p>
        <p><strong>Stack:</strong> ${error instanceof Error ? error.stack : 'No stack trace'}</p>
      </div>
    `;
  }
}
