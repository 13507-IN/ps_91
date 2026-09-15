/**
 * ArthSetu — Progressive Web App Service Worker
 * Implements App Shell caching, static asset caching, and network-first API caching.
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE_NAME = `arthsetu-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `arthsetu-runtime-${CACHE_VERSION}`;

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/assessment-wizard',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning during SW install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and SSE streams
  if (request.method !== 'GET' || url.pathname.includes('/analyze-stream')) {
    return;
  }

  // Next.js static chunks / fonts / images: Cache-First
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|woff|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // API Requests: Network-first with Stale-While-Revalidate fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ error: 'Offline mode active' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Page Navigation: Network-First with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          return caches.match('/');
        });
      })
    );
    return;
  }

  // Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
      return cached || fetchPromise;
    })
  );
});
