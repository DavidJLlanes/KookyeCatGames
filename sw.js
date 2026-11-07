const CACHE = 'kookye-cat-games-shell-v14';
const FILES = [
  './', './index.html', './manifest.webmanifest', './assets/icon.svg', './assets/favicon-32.png', './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png', './assets/og-games.svg', './assets/og-games.png',
  './assets/art/hero.svg', './assets/art/picross.svg', './assets/art/trophy.svg', './assets/css/base.css', './assets/js/home.js', './assets/js/storage.js', './assets/js/achievements.js',
  './assets/js/pwa-update.js',
  './assets/js/share-card.js', './assets/js/zip.js', './assets/js/backups.js', './games/picross/', './games/picross/index.html',
  './games/picross/game.json', './games/picross/picross.css', './games/picross/picross-responsive.css', './games/picross/picross.js', './games/picross/gesture.js', './games/picross/rules.js', './games/picross/puzzle.js',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('kookye-cat-games-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  if (['image', 'font'].includes(event.request.destination)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, response.clone())));
      return response;
    })));
    return;
  }
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') return caches.match('./index.html');
    return Response.error();
  }));
});
