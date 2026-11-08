const CACHE = 'kookye-cat-games-shell-v61';
const FILES = [
  './tuberias/', './tuberias/levels.js', './tuberias/engine.js', './tuberias/rules.js', './tuberias/scoring.js', './tuberias/interface.js', './tuberias/game.json', './tuberias/tuberias.js', './tuberias/index.html', './tuberias/tuberias.css', './tuberias/achievements.js', './tuberias/assets/icon.svg', './tuberias/assets/cover.svg',
  './lights/', './lights/engine.js', './lights/lights.js', './lights/index.html', './lights/lights.css', './lights/interface.js', './lights/rules.js', './lights/scoring.js', './lights/game.json', './lights/achievements.js', './lights/assets/icon.svg', './lights/assets/cover.svg',
  './assets/css/game-interface.css', './assets/js/game-interface.js',
  './picross/interface.js', './2048/interface.js', './bubbleshooter/interface.js', './tetris/', './tetris/index.html', './tetris/game.json', './tetris/rules.js', './tetris/engine.js', './tetris/scoring.js', './tetris/achievements.js', './tetris/tetris.js', './tetris/interface.js', './tetris/tetris.css', './tetris/assets/icon.svg', './tetris/assets/cover.svg',
  './rush/', './rush/index.html', './rush/game.json', './rush/rules.js', './rush/engine.js', './rush/scoring.js', './rush/achievements.js', './rush/rush.js', './rush/interface.js', './rush/rush.css', './rush/assets/icon.svg', './rush/assets/cover.svg',
  './bubbleshooter/', './bubbleshooter/index.html', './bubbleshooter/game.json',
  './bubbleshooter/rules.js', './bubbleshooter/engine.js', './bubbleshooter/renderer.js',
  './bubbleshooter/controls.js', './bubbleshooter/bubble.js', './bubbleshooter/bubble.css',
  './bubbleshooter/scoring.js', './bubbleshooter/achievements.js', './bubbleshooter/assets/icon.svg', './bubbleshooter/assets/cover.svg',
  './', './index.html', './manifest.webmanifest', './assets/icon.svg', './assets/favicon-32.png', './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png', './assets/og-games.svg', './assets/og-games.png',
  './assets/art/fusion-2048.svg', './assets/art/hero.svg', './assets/art/picross.svg', './assets/art/trophy.svg', './assets/css/base.css', './assets/js/home.js', './assets/js/storage.js', './assets/js/achievements.js',
  './assets/js/pwa-update.js', './assets/js/mobile-zoom-lock.js', './assets/js/mascot.js', './assets/css/mascot.css', './assets/js/game-sound.js', './assets/css/game-sound.css', './assets/mascot/sit.webp', './assets/mascot/wave.webp', './assets/mascot/play.webp', './assets/mascot/celebrate.webp',
  './assets/css/achievements.css', './assets/css/profile-actions.css', './core/game-registry.js', './core/scores.js', './core/achievements.js', './core/arcade-achievements.js', './core/events.js', './assets/js/share-card.js', './assets/js/zip.js', './assets/js/backups.js', './picross/', './picross/index.html',
  './2048/', './2048/index.html', './2048/game.json', './2048/fusion.css', './2048/fusion.js', './2048/engine.js', './2048/scoring.js', './2048/achievements.js', './2048/assets/icon.svg', './picross/achievements.js', './picross/scoring.js', './picross/game.json', './picross/picross.css', './picross/picross.js', './picross/gesture.js', './picross/rules.js', './picross/logic.js', './picross/puzzle.js',
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
