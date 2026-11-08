const CHECK_INTERVAL = 6 * 60 * 60 * 1000;
const CHECK_KEY = 'kcg:pwa:last-check';
const NOTICE_KEY = 'kcg:pwa:updated';

/** Check releases on entry and at most once per six hours, only while visible and online. */
export async function enablePwaUpdates(workerPath, notify, beforeReload = async () => {}) {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  try {
    if (sessionStorage.getItem(NOTICE_KEY)) {
      sessionStorage.removeItem(NOTICE_KEY);
      notify('La aplicación se ha actualizado a la última versión.');
    }
  } catch { /* Private mode may disable web storage. */ }

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', async () => {
    if (!hadController || reloading) return;
    reloading = true;
    try { await beforeReload(); } catch { /* Progress is saved after each move. */ }
    try { sessionStorage.setItem(NOTICE_KEY, '1'); } catch { /* Storage unavailable. */ }
    location.reload();
  });

  // Avoid calling register() on every game navigation: it initiates an update
  // check. Reuse the shared /games/ registration and check it on our own schedule.
  let registration = await navigator.serviceWorker.getRegistration();
  const isNewRegistration = !registration;
  if (!registration) registration = await navigator.serviceWorker.register(workerPath);

  let memoryLastCheck = 0;
  const readLastCheck = () => {
    let timestamp = memoryLastCheck;
    try { timestamp = Math.max(timestamp, Number(localStorage.getItem(CHECK_KEY)) || 0); } catch { /* Try session storage. */ }
    try { timestamp = Math.max(timestamp, Number(sessionStorage.getItem(CHECK_KEY)) || 0); } catch { /* Use the in-memory timestamp. */ }
    return timestamp;
  };
  const recordCheck = timestamp => {
    memoryLastCheck = timestamp;
    try { localStorage.setItem(CHECK_KEY, String(timestamp)); } catch { /* Try a per-tab fallback. */ }
    try { sessionStorage.setItem(CHECK_KEY, String(timestamp)); } catch { /* In-memory throttle still works. */ }
  };

  // A new registration already performs its first check as part of register().
  if (isNewRegistration) recordCheck(Date.now());

  const check = () => {
    if (!navigator.onLine || document.hidden) return;
    const now = Date.now();
    if (now - readLastCheck() < CHECK_INTERVAL) return;

    // This requests the small worker script. Game assets are downloaded only if
    // its version changed; the new worker precaches once and activates itself.
    recordCheck(now);
    registration.update().catch(() => {});
  };

  let timer;
  const scheduleNextCheck = () => {
    clearTimeout(timer);
    if (document.hidden || !navigator.onLine) return;
    const remaining = CHECK_INTERVAL - (Date.now() - readLastCheck());
    timer = window.setTimeout(() => { check(); scheduleNextCheck(); }, Math.max(0, remaining));
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
    else { check(); scheduleNextCheck(); }
  });
  window.addEventListener('online', () => { check(); scheduleNextCheck(); });
  if (!isNewRegistration) check();
  scheduleNextCheck();
}
