const CACHE = 'kookye-cat-games-shell-v47';
const FILES = [
  './games/bubbleshooter/', './games/bubbleshooter/index.html', './games/bubbleshooter/game.json',
  './games/bubbleshooter/rules.js', './games/bubbleshooter/engine.js', './games/bubbleshooter/renderer.js',
  './games/bubbleshooter/controls.js', './games/bubbleshooter/bubble.js', './games/bubbleshooter/bubble.css',
  './games/bubbleshooter/scoring.js', './games/bubbleshooter/achievements.js', './games/bubbleshooter/assets/icon.svg', './games/bubbleshooter/assets/cover.svg',
  './', './index.html', './manifest.webmanifest', './assets/icon.svg', './assets/favicon-32.png', './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png', './assets/og-games.svg', './assets/og-games.png',
  './assets/art/fusion-2048.svg', './assets/art/hero.svg', './assets/art/picross.svg', './assets/art/trophy.svg', './assets/css/base.css', './assets/js/home.js', './assets/js/storage.js', './assets/js/achievements.js',
  './assets/js/pwa-update.js', './assets/js/mascot.js', './assets/css/mascot.css', './assets/js/game-sound.js', './assets/css/game-sound.css', './assets/mascot/sit.webp', './assets/mascot/wave.webp', './assets/mascot/play.webp', './assets/mascot/celebrate.webp',
  './assets/css/achievements.css', './assets/css/profile-actions.css', './core/game-registry.js', './core/scores.js', './core/achievements.js', './core/arcade-achievements.js', './core/events.js', './assets/js/share-card.js', './assets/js/zip.js', './assets/js/backups.js', './games/picross/', './games/picross/index.html',
  './games/2048/', './games/2048/index.html', './games/2048/game.json', './games/2048/fusion.css', './games/2048/fusion.js', './games/2048/engine.js', './games/2048/scoring.js', './games/2048/achievements.js', './games/2048/assets/icon.svg', './games/picross/achievements.js', './games/picross/scoring.js', './games/picross/game.json', './games/picross/picross.css', './games/picross/picross-responsive.css', './games/picross/picross.js', './games/picross/gesture.js', './games/picross/rules.js', './games/picross/logic.js', './games/picross/puzzle.js',
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
    event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request).then(response => {
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
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    if (event.request.mode === 'navigate') return caches.match('./index.html');
    return Response.error();
  }));
});
