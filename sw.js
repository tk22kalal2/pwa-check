const CACHE_NAME = 'pwa-custom-domain-v2';
const urlsToCache = [
  './',
  './index.html',
  './app.html',
  './app.webmanifest',
  './styles.css',
  './scripts.js',
  './icon-192.png',
  './icon-512.png'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Only handle requests from our own origin
  if (requestUrl.origin !== location.origin) {
    return;
  }
  
  // For navigation requests, serve app.html when the app is installed
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./app.html').then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }
  
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then(response => {
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
