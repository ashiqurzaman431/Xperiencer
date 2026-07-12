// Xperiencer Service Worker
const CACHE_NAME = 'xperiencer-v4';
const PRECACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  // Network-first (never cached) for anything backend/live-data related:
  // Google Drive (legacy migration reads), Firebase Auth/RTDB, and
  // Cloudinary cover images. All of these need to always be fresh, never
  // served from a stale cache.
  const url = event.request.url;
  if (url.includes('googleapis.com') ||
      url.includes('accounts.google.com') ||
      url.includes('firebasedatabase.app') ||
      url.includes('firebaseapp.com') ||
      url.includes('gstatic.com/firebasejs') ||
      url.includes('res.cloudinary.com') ||
      url.includes('api.cloudinary.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // Cache-first for app shell
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
