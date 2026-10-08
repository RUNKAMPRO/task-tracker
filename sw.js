// ==============================================================================
// OrbitSuite Service Worker (Offline & PWA Caching Engine)
// ==============================================================================

const CACHE_VERSION = 'orbitsuite-v3.6.0';
const STATIC_CACHE_NAME = `orbitsuite-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `orbitsuite-runtime-${CACHE_VERSION}`;

// Critical assets required for full offline functionality
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/orbit-os.css',
  './js/app.js',
  './js/config.js',
  './js/orbit-os.js',
  './js/spotify-service.js',
  './manifest.webmanifest',
  './manifest.json',
  './favicon.ico',
  './icons/orbitsuite_icon.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png'
];

// 1. Install Event: Precaching static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[ServiceWorker] Some assets could not be precached:', err);
      });
    })
  );
});

// 2. Activate Event: Clean up legacy caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE_NAME && key !== RUNTIME_CACHE_NAME) {
            console.log('[ServiceWorker] Purging legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Dual Caching Strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip cross-origin or non-GET requests (e.g. Supabase POST/REST requests)
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip caching Supabase API or external auth / streaming calls
  if (url.hostname.includes('supabase.co') || url.hostname.includes('spotify.com')) {
    return;
  }

  // Strategy A: HTML Documents -> Network First with Stale-While-Revalidate Fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Strategy B: Local App Assets (css, js, icons): Stale While Revalidate
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      const fetchPromise = fetch(req)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
