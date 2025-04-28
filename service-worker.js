const CACHE_NAME = 'archery-app-cache-v1';
const urlsToCache = [
  '/',
  '/main4.html',
  '/app.js',
  '/style.css',
  // Add any other images or fonts you use
];

// Install event: cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event: serve from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
