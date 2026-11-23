const CACHE_PREFIX = 'item-posting-assistant-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v0.26.11.23.1`;
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/app-icon.svg', './icons/app-icon-192.png', './icons/app-icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status >= 500) return caches.match('./index.html', {cacheName: CACHE_NAME}).then(shell => shell || response);
          return response;
        })
        .catch(() => caches.match('./index.html', {cacheName: CACHE_NAME}).then(shell => shell || Response.error()))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
