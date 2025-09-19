// Service Worker for My IEP Hero - Offline Support
const CACHE_NAME = 'iep-hero-cache-v1';
const OFFLINE_CACHE_NAME = 'iep-hero-offline-v1';
const RUNTIME_CACHE_NAME = 'iep-hero-runtime-v1';

// Static assets to cache immediately (cache-first strategy)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon.png',
  '/superhero-icon-1757881228.png'
];

// API routes that need offline fallbacks (network-first strategy)
const OFFLINE_FALLBACK_APIS = [
  '/api/auth/user',
  '/api/students',
  '/api/documents',
  '/api/goals',
  '/api/messages',
  '/api/iep-reviews'
];

// Critical pages to cache for offline access
const CRITICAL_PAGES = [
  '/parent/dashboard-free',
  '/parent/dashboard-essential',
  '/parent/dashboard-premium',
  '/parent/dashboard-hero',
  '/advocate/dashboard-starter',
  '/advocate/dashboard-pro',
  '/advocate/dashboard-agency',
  '/parent/students',
  '/advocate/students',
  '/document-vault',
  '/goal-generator',
  '/parent/messages',
  '/advocate/messages'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== OFFLINE_CACHE_NAME && 
                cacheName !== RUNTIME_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (request.method === 'GET') {
    if (isStaticAsset(request.url)) {
      // Static assets: Cache-first strategy
      event.respondWith(cacheFirstStrategy(request));
    } else if (isAPIRequest(request.url)) {
      // API requests: Network-first with offline fallback
      event.respondWith(networkFirstWithOfflineFallback(request));
    } else if (isCriticalPage(request.url)) {
      // Critical pages: Network-first with cache fallback
      event.respondWith(networkFirstStrategy(request));
    } else {
      // Everything else: Network-first with cache fallback
      event.respondWith(networkFirstStrategy(request));
    }
  } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    // Handle write operations - queue for offline sync
    event.respondWith(handleWriteOperation(request));
  }
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📱 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache-first strategy failed:', error);
    return new Response('Offline - Asset not available', { status: 503 });
  }
}

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('🌐 Served from network and cached:', request.url);
      return networkResponse;
    }
    
    // If network fails, try cache
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📱 Serving stale content from cache:', request.url);
      return addOfflineHeaders(cachedResponse);
    }
    
    return new Response('Offline - Content not available', { status: 503 });
  } catch (error) {
    // Network error - try cache
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📱 Network failed, serving from cache:', request.url);
      return addOfflineHeaders(cachedResponse);
    }
    
    return createOfflineResponse(request.url);
  }
}

// Network-first with offline fallback for API requests
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Store successful API responses for offline access
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network request fails, check offline cache
    return getOfflineFallback(request);
  } catch (error) {
    console.log('🔌 Network error for API request, using offline fallback');
    return getOfflineFallback(request);
  }
}

// Handle write operations (POST, PUT, PATCH)
async function handleWriteOperation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Queue the operation for later sync
    console.log('📝 Queueing write operation for offline sync');
    await queueOfflineOperation(request);
    
    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Operation queued for sync when online'
      }),
      {
        status: 202,
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Queued': 'true'
        }
      }
    );
  }
}

// Get offline fallback for API requests
async function getOfflineFallback(request) {
  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('📱 Serving cached API response:', request.url);
    return addOfflineHeaders(cachedResponse);
  }
  
  // Return structured offline response for specific API endpoints
  const url = new URL(request.url);
  
  if (url.pathname.includes('/api/students')) {
    return createOfflineAPIResponse({ students: [], message: 'Offline - using cached data' });
  } else if (url.pathname.includes('/api/documents')) {
    return createOfflineAPIResponse({ documents: [], message: 'Offline - using cached data' });
  } else if (url.pathname.includes('/api/goals')) {
    return createOfflineAPIResponse({ goals: [], message: 'Offline - using cached data' });
  } else if (url.pathname.includes('/api/messages')) {
    return createOfflineAPIResponse({ messages: [], message: 'Offline - using cached data' });
  }
  
  return new Response(
    JSON.stringify({ error: 'Offline - Data not available' }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Offline': 'true'
      }
    }
  );
}

// Queue offline operations for later sync
async function queueOfflineOperation(request) {
  const operation = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };
  
  // Store in IndexedDB for persistent queuing
  const db = await openOfflineDB();
  const transaction = db.transaction(['operations'], 'readwrite');
  const store = transaction.objectStore('operations');
  await store.add(operation);
}

// Open IndexedDB for offline operations
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('IEPHeroOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('operations')) {
        const store = db.createObjectStore('operations', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains('cache')) {
        const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Helper functions
function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.includes('.js') || 
         url.includes('.css') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.svg') || 
         url.includes('.ico') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

function isAPIRequest(url) {
  return url.includes('/api/');
}

function isCriticalPage(url) {
  return CRITICAL_PAGES.some(page => url.includes(page));
}

function addOfflineHeaders(response) {
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'X-Offline': 'true',
      'X-Cache-Date': new Date().toISOString()
    }
  });
  return newResponse;
}

function createOfflineAPIResponse(data) {
  return new Response(
    JSON.stringify({ ...data, offline: true }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Offline': 'true'
      }
    }
  );
}

function createOfflineResponse(url) {
  const offlineHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - My IEP Hero</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; text-align: center; }
        .offline-container { max-width: 400px; margin: 100px auto; }
        .offline-icon { font-size: 64px; margin-bottom: 20px; }
        .offline-title { font-size: 24px; margin-bottom: 10px; color: #333; }
        .offline-message { color: #666; margin-bottom: 20px; }
        .retry-button { background: #007AFF; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">This content isn't available offline yet. Please check your connection and try again.</p>
        <button class="retry-button" onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html',
      'X-Offline': 'true'
    }
  });
}

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(syncOfflineOperations());
  }
});

// Sync queued offline operations
async function syncOfflineOperations() {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['operations'], 'readwrite');
    const store = transaction.objectStore('operations');
    const operationsResult = await store.getAll();
    
    // Fix: Ensure operations is always an array
    const operations = Array.isArray(operationsResult) ? operationsResult : [];
    
    console.log(`🔄 Syncing ${operations.length} offline operations`);
    
    for (const operation of operations) {
      try {
        const response = await fetch(operation.url, {
          method: operation.method,
          headers: operation.headers,
          body: operation.body
        });
        
        if (response.ok) {
          console.log('✅ Synced operation:', operation.url);
          await store.delete(operation.id);
        } else {
          console.warn('⚠️ Failed to sync operation:', operation.url, response.status);
        }
      } catch (error) {
        console.error('❌ Error syncing operation:', operation.url, error);
      }
    }
    
    // Notify the main thread about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        syncedCount: operations.length
      });
    });
  } catch (error) {
    console.error('❌ Background sync failed:', error);
    // Gracefully handle database errors
    if (error.name === 'NotFoundError' || error.name === 'InvalidStateError') {
      console.log('🔧 Offline database not ready, skipping sync');
    }
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    });
  }
});

console.log('🚀 Service Worker loaded successfully');