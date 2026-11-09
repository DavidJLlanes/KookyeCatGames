const CACHE = 'kookye-cat-games-shell-v72';
const FILES = [
  './inunda/',
  './inunda/levels.js',
  './inunda/engine.js',
  './inunda/rules.js',
  './inunda/scoring.js',
  './inunda/interface.js',
  './inunda/game.json',
  './inunda/index.html',
  './inunda/inunda.css',
  './inunda/inunda.js',
  './inunda/assets/achievements/inunda-01.svg',
  './inunda/assets/achievements/inunda-02.svg',
  './inunda/assets/achievements/inunda-03.svg',
  './inunda/assets/achievements/inunda-04.svg',
  './inunda/assets/achievements/inunda-05.svg',
  './inunda/assets/achievements/inunda-06.svg',
  './inunda/assets/achievements/inunda-07.svg',
  './inunda/assets/achievements/inunda-08.svg',
  './inunda/assets/achievements/inunda-09.svg',
  './inunda/assets/achievements/inunda-10.svg',
  './inunda/assets/achievements/inunda-11.svg',
  './inunda/assets/achievements/inunda-12.svg',
  './inunda/assets/achievements/inunda-13.svg',
  './inunda/assets/achievements/inunda-14.svg',
  './inunda/assets/achievements/inunda-15.svg',
  './inunda/assets/achievements/inunda-16.svg',
  './inunda/assets/achievements/inunda-17.svg',
  './inunda/assets/achievements/inunda-18.svg',
  './inunda/assets/achievements/inunda-19.svg',
  './inunda/assets/achievements/inunda-20.svg',
  './inunda/assets/achievements/inunda-21.svg',
  './inunda/assets/achievements/inunda-22.svg',
  './inunda/assets/achievements/inunda-23.svg',
  './inunda/assets/achievements/inunda-24.svg',
  './inunda/assets/achievements/inunda-25.svg',
  './inunda/assets/achievements/inunda-26.svg',
  './inunda/assets/achievements/inunda-27.svg',
  './inunda/assets/achievements/inunda-28.svg',
  './inunda/assets/achievements/inunda-29.svg',
  './inunda/assets/achievements/inunda-30.svg',
  './inunda/assets/achievements/inunda-31.svg',
  './inunda/assets/achievements/inunda-32.svg',
  './inunda/assets/achievements/inunda-33.svg',
  './inunda/assets/achievements/inunda-34.svg',
  './inunda/assets/achievements/inunda-35.svg',
  './inunda/achievements.js',
  './inunda/assets/icon.svg',
  './inunda/assets/cover.svg',
  './cajas/levels.js',
  './cajas/engine.js',
  './cajas/rules.js',
  './cajas/scoring.js',
  './cajas/cajas.js',
  './cajas/index.html',
  './cajas/interface.js',
  './cajas/cajas.css',
  './cajas/achievements.js',
  './cajas/assets/cover.svg',
  './cajas/assets/icon.svg',
  './cajas/assets/achievements/cajas-01.svg',
  './cajas/assets/achievements/cajas-02.svg',
  './cajas/assets/achievements/cajas-03.svg',
  './cajas/assets/achievements/cajas-04.svg',
  './cajas/assets/achievements/cajas-05.svg',
  './cajas/assets/achievements/cajas-06.svg',
  './cajas/assets/achievements/cajas-07.svg',
  './cajas/assets/achievements/cajas-08.svg',
  './cajas/assets/achievements/cajas-09.svg',
  './cajas/assets/achievements/cajas-10.svg',
  './cajas/assets/achievements/cajas-11.svg',
  './cajas/assets/achievements/cajas-12.svg',
  './cajas/assets/achievements/cajas-13.svg',
  './cajas/assets/achievements/cajas-14.svg',
  './cajas/assets/achievements/cajas-15.svg',
  './cajas/assets/achievements/cajas-16.svg',
  './cajas/assets/achievements/cajas-17.svg',
  './cajas/assets/achievements/cajas-18.svg',
  './cajas/assets/achievements/cajas-19.svg',
  './cajas/assets/achievements/cajas-20.svg',
  './cajas/assets/achievements/cajas-21.svg',
  './cajas/assets/achievements/cajas-22.svg',
  './cajas/assets/achievements/cajas-23.svg',
  './cajas/assets/achievements/cajas-24.svg',
  './cajas/assets/achievements/cajas-25.svg',
  './cajas/assets/achievements/cajas-26.svg',
  './cajas/assets/achievements/cajas-27.svg',
  './cajas/assets/achievements/cajas-28.svg',
  './cajas/assets/achievements/cajas-29.svg',
  './cajas/assets/achievements/cajas-30.svg',
  './cajas/assets/achievements/cajas-31.svg',
  './cajas/assets/achievements/cajas-32.svg',
  './cajas/assets/achievements/cajas-33.svg',
  './cajas/assets/achievements/cajas-34.svg',
  './cajas/assets/achievements/cajas-35.svg',
  './cajas/game.json',
  './cajas/',
"./ilumina/levels.js","./ilumina/engine.js","./ilumina/rules.js","./ilumina/scoring.js","./ilumina/ilumina.js","./ilumina/index.html","./ilumina/ilumina.css","./ilumina/interface.js","./ilumina/game.json","./ilumina/achievements.js","./ilumina/assets/achievements/ilumina-01.svg","./ilumina/assets/achievements/ilumina-02.svg","./ilumina/assets/achievements/ilumina-03.svg","./ilumina/assets/achievements/ilumina-04.svg","./ilumina/assets/achievements/ilumina-05.svg","./ilumina/assets/achievements/ilumina-06.svg","./ilumina/assets/achievements/ilumina-07.svg","./ilumina/assets/achievements/ilumina-08.svg","./ilumina/assets/achievements/ilumina-09.svg","./ilumina/assets/achievements/ilumina-10.svg","./ilumina/assets/achievements/ilumina-11.svg","./ilumina/assets/achievements/ilumina-12.svg","./ilumina/assets/achievements/ilumina-13.svg","./ilumina/assets/achievements/ilumina-14.svg","./ilumina/assets/achievements/ilumina-15.svg","./ilumina/assets/achievements/ilumina-16.svg","./ilumina/assets/achievements/ilumina-17.svg","./ilumina/assets/achievements/ilumina-18.svg","./ilumina/assets/achievements/ilumina-19.svg","./ilumina/assets/achievements/ilumina-20.svg","./ilumina/assets/achievements/ilumina-21.svg","./ilumina/assets/achievements/ilumina-22.svg","./ilumina/assets/achievements/ilumina-23.svg","./ilumina/assets/achievements/ilumina-24.svg","./ilumina/assets/achievements/ilumina-25.svg","./ilumina/assets/achievements/ilumina-26.svg","./ilumina/assets/achievements/ilumina-27.svg","./ilumina/assets/achievements/ilumina-28.svg","./ilumina/assets/achievements/ilumina-29.svg","./ilumina/assets/achievements/ilumina-30.svg","./ilumina/assets/achievements/ilumina-31.svg","./ilumina/assets/achievements/ilumina-32.svg","./ilumina/assets/achievements/ilumina-33.svg","./ilumina/assets/achievements/ilumina-34.svg","./ilumina/assets/achievements/ilumina-35.svg","./ilumina/assets/cover.svg","./ilumina/assets/icon.svg",
'./ilumina/',
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
