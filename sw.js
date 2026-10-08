// ==============================================================================
// OrbitSuite Service Worker (Offline & PWA Caching Engine)
// ==============================================================================

const CACHE_VERSION = 'orbitsuite-v3.0.0';
const STATIC_CACHE_NAME = `orbitsuite-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `orbitsuite-runtime-${CACHE_VERSION}`;

// Critical assets required for full offline functionality
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './config.js',
  './orbit-os.css',
  './orbit-os.js',
  './spotify-service.js',
  './manifest.webmanifest',
  './manifest.json',
  './favicon.ico',
  './orbitsuite_icon.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png'
];

// 1. Install Event: Precaching static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        // Use individual add or addAll with fallback
        return Promise.all(
          PRECACHE_ASSETS.map(url => {
            return cache.add(url).catch(err => {
              console.warn('[ServiceWorker] Failed to precache:', url, err);
            });
          })
        );
      })
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', event => {
  const currentCaches = [STATIC_CACHE_NAME, RUNTIME_CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[ServiceWorker] Purging legacy cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Smart Cache Strategy (Stale-While-Revalidate & Offline Fallback)
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests with http/https schemes
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // A. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then(cache => cache.put('./index.html', responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match('./index.html') || await caches.match('./');
          if (cachedResponse) return cachedResponse;
          return new Response('OrbitSuite ist offline. Bitte verbinde dich wieder mit dem Netzwerk.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // B. Local App Assets (style.css, app.js, icons): Network First with Cache Fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          throw new Error('Resource unavailable offline');
        })
    );
    return;
  }

  // C. External Resources (Google Fonts, CDN): Cache First with Background Fetch
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network Fetch
  event.respondWith(fetch(request));
});
