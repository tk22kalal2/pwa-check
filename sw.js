const CACHE_NAME = 'pwa-custom-domain-v4';
const BASE_URL = self.location.origin;

const urlsToCache = [
  '/',
  '/index.html',
  '/app.html',
  '/app.webmanifest',
  '/styles.css',
  '/scripts.js',
  '/icon-192.png',
  '/icon-512.png'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {credentials: 'same-origin'})));
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (requestUrl.origin !== BASE_URL) {
    return;
  }
  
  // For navigation requests, serve the appropriate page
  if (event.request.mode === 'navigate') {
    // Check if this is the root request
    if (requestUrl.pathname === '/') {
      event.respondWith(
        caches.match('/index.html')
          .then(response => response || fetch(event.request))
      );
    } else {
      event.respondWith(
        caches.match(event.request)
          .then(response => response || fetch(event.request))
      );
    }
    return;
  }
  
  // For all other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        
        return fetch(event.request).then(response => {
          if(!response || response.status !== 200) return response;
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
            
          return response;
        });
      })
  );
});

// Update the service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
