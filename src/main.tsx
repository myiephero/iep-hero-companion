import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { offlineStorage } from './lib/offlineStorage'

// Register service worker for offline support
if ('serviceWorker' in navigator) {
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
