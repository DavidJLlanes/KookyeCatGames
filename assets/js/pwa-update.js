const CHECK_INTERVAL = 6 * 60 * 60 * 1000;
const CHECK_KEY = 'kcg:pwa:last-check';
const NOTICE_KEY = 'kcg:pwa:updated';

/** Register the shared PWA, check sparingly, and announce an installed update. */
export async function enablePwaUpdates(workerPath, notify, beforeReload = async () => {}) {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  try {
    if (sessionStorage.getItem(NOTICE_KEY)) {
      sessionStorage.removeItem(NOTICE_KEY);
      notify('La aplicación se ha actualizado a la última versión.');
    }
  } catch { /* Private browsing can disable web storage. */ }

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', async () => {
    if (!hadController || reloading) return;
    reloading = true;
    try { await beforeReload(); } catch { /* Active progress is saved after each move. */ }
    try { sessionStorage.setItem(NOTICE_KEY, '1'); } catch { /* Storage unavailable. */ }
    location.reload();
  });

  const registration = await navigator.serviceWorker.register(workerPath);
  const check = () => {
    if (!navigator.onLine || document.hidden) return;
    const now = Date.now();
    try {
      const last = Number(localStorage.getItem(CHECK_KEY)) || 0;
      if (now - last < CHECK_INTERVAL) return;
      localStorage.setItem(CHECK_KEY, String(now));
    } catch { return; }
    registration.update().catch(() => {});
  };
  // register() already asks the browser to check the worker on page load.
  try { if (!localStorage.getItem(CHECK_KEY)) localStorage.setItem(CHECK_KEY, String(Date.now())); } catch { /* Storage unavailable. */ }
  document.addEventListener('visibilitychange', check);
  window.addEventListener('online', check);
}
