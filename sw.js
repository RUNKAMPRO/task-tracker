// ==============================================================================
// OrbitSuite Service Worker (Offline & Instant PWA Caching Engine)
// ==============================================================================

const CACHE_VERSION = 'orbitsuite-v3.6.2';
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

// 2. Activate Event: Clean up legacy caches & take immediate control
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

// 3. Fetch Event: Instant Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip cross-origin non-GET requests or browser schemes
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip live dynamic APIs: Supabase DB, Spotify API, or local Folienwerk port
  if (url.hostname.includes('supabase.co') || url.hostname.includes('spotify.com') || url.port === '8765') {
    return;
  }

  // Strategy A: HTML Document Navigation -> Instant Cache (0ms), revalidate in background
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(async cachedResponse => {
        const fallback = cachedResponse || (await caches.match('./index.html', { ignoreSearch: true }));

        const networkFetch = fetch(req)
          .then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(req, clone));
            }
            return networkResponse;
          })
          .catch(() => fallback);

        // If cached HTML exists, serve it in ~0ms for instant app launch
        return fallback || networkFetch;
      })
    );
    return;
  }

  // Strategy B: App Assets (CSS, JS, Fonts, Images) -> Stale-While-Revalidate with search param tolerance
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cachedResponse => {
      const fetchPromise = fetch(req)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // Return instant cached response (0ms) if available, otherwise network fetch
      return cachedResponse || fetchPromise;
    })
  );
});
