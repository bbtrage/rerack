/* eslint-disable no-restricted-globals */

// ReRack Service Worker
// Provides offline support and caching for the Progressive Web App

const VERSION = 'v1';
const CACHE_NAME = `rerack-${VERSION}`;
const RUNTIME_CACHE = `rerack-runtime-${VERSION}`;
const IMAGE_CACHE = `rerack-images-${VERSION}`;
const API_CACHE = `rerack-api-${VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service worker: Caching app shell');
      // Use Promise.allSettled to continue even if some assets fail
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err);
          })
        )
      );
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            console.log('Service worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Allowed third-party origins for caching
  const ALLOWED_ORIGINS = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  // Check if origin is allowed (same-origin or in allowed list)
  const isAllowedOrigin = url.origin === self.location.origin ||
                          ALLOWED_ORIGINS.includes(url.origin) ||
                          url.hostname.endsWith('.supabase.co') ||
                          url.hostname.endsWith('.exercisedb.io') ||
                          url.hostname === 'exercisedb.p.rapidapi.com';

  // Skip requests from disallowed origins
  if (!isAllowedOrigin) {
    return;
  }

  // Images and GIFs - Cache First
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Fonts - Cache First
  if (ALLOWED_ORIGINS.includes(url.origin)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // API calls (Supabase, ExerciseDB) - Network First
  if (url.hostname.endsWith('.supabase.co') || 
      url.hostname.endsWith('.exercisedb.io') ||
      url.hostname === 'exercisedb.p.rapidapi.com') {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Navigation requests - Network First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Serve from cache or return app shell
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Default - Cache First for app resources, Network First for everything else
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  }
});

// Cache First Strategy - fastest for static assets
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Fetch failed; returning offline page instead.', error);
    // Could return a custom offline page here
    throw error;
  }
}

// Network First Strategy - best for dynamic content
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline workout logging
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(
      // Trigger sync - the actual sync logic is in the app's storage module
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC' });
        });
      })
    );
  }
});

