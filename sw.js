// ==============================================================================
// OrbitSuite Service Worker (Offline & Instant PWA Caching Engine)
// ==============================================================================

const CACHE_VERSION = 'orbitsuite-v3.7.1';
const STATIC_CACHE_NAME = `orbitsuite-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `orbitsuite-runtime-${CACHE_VERSION}`;

// Critical assets required for full offline functionality
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/orbit-os.css',
  './css/orbit-voice.css',
  './js/app.js',
  './js/config.js',
  './js/orbit-os.js',
  './js/orbit-voice.js',
  './js/spotify-service.js',
  './manifest.webmanifest',
  './favicon.ico',
  './icons/orbitsuite_icon.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './data/puzzles/queens_data.json',
  './data/puzzles/tango_data.json',
  './data/puzzles/sudoku_data.json',
  './data/puzzles/zip_data.json',
  './data/puzzles/pinpoint_data.json',
  './data/puzzles/crossclimb_data.json'
];

// 1. Install Event: Precaching static assets & immediate activation
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

// 2. Activate Event: Wipe all legacy caches & claim all clients immediately
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

// 3. Fetch Event: Network-First for Code & Documents, Cache-First for static media
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip cross-origin non-GET requests or browser schemes
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strictly skip live dynamic APIs: Supabase DB, Spotify API, Google APIs, local Folienwerk
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('spotify.com') ||
    url.hostname.includes('googleapis.com') ||
    url.port === '8765'
  ) {
    return;
  }

  const isNavigation = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html');

  // Strategy A: Network-First for HTML navigation and JS/CSS code files.
  // Guarantees normal reloads (F5) ALWAYS load the newest changes when online,
  // falling back to cache when offline.
  if (isNavigation || isCode) {
    event.respondWith(
      fetch(req)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cached = await caches.match(req);
          if (cached) return cached;
          if (isNavigation) {
            return caches.match('./index.html') || caches.match('./');
          }
        })
    );
    return;
  }

  // Strategy B: Cache-First for static assets (images, icons, sounds, puzzles)
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(req).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return networkResponse;
      });
    })
  );
});
