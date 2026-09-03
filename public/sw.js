const CACHE_NAME = 'campaign-trail-v1.2';

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
      console.log('[SW] Pre-caching core game assets');
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
            console.log('[SW] Clearing old cache:', key);
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

  // For HTML documents, use network-first with cache fallback
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

  // For static assets (images, audio, js, fonts), use cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Cache successful responses for our domain
          if (response.status === 200 && (url.origin === self.location.origin || url.hostname.includes('fonts.'))) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(err => {
          // Fallback if needed
          return cached;
        });
    })
  );
});
