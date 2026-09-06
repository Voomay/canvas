const CACHE_NAME = 'canvassing-sa-v2.1';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-512-maskable.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/backgrounds/locations/capetown.png',
  '/assets/backgrounds/locations/joburg.png',
  '/assets/backgrounds/clouds/clouds_sky.png',
  '/assets/backgrounds/houses/suburb_houses.png',
  '/assets/roads/clean/pavement_road.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching core game assets for', CACHE_NAME);
      return cache.addAll(STATIC_PRECACHE).catch(err => {
        console.warn('[SW] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache partition:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. For HTML navigation and entry documents: Network-First with cache fallback
  if (event.request.headers.get('accept')?.includes('text/html') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/')))
    );
    return;
  }

  // 2. For scripts and styles (.js, .css): Network-First to guarantee immediate updates on new builds
  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.includes('/assets/');
  if (isCode && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. For media assets (images, audio, fonts): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (response.status === 200 && (url.origin === self.location.origin || url.hostname.includes('fonts.'))) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
