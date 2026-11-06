const DATABASE = 'kookye-cat-games-local';
const VERSION = 1;
const STORE = 'player-profile';
const PROFILE_KEY = 'local';
const FALLBACK_KEY = 'kcg:profile:v1';
const PICROSS_LEVEL_COUNT = 60;

export function createEmptyProfile() {
  return {
    schemaVersion: 1,
    stats: { gamesPlayed: 0, gamesSolved: 0, playSeconds: 0, totalPoints: 0 },
    achievements: [],
    games: {
      picross: { gamesPlayed: 0, solved: 0, playedSeconds: 0, totalPoints: 0, bestScore: 0, bestTime: null, completedPuzzles: [], completedLevels: [], unlockedLevel: 1, active: null },
    },
  };
}

export function normalizeProfile(value) {
  const base = createEmptyProfile();
  if (!value || typeof value !== 'object') return base;
  const savedPicross = value.games?.picross || {};
  const completedLevels = Array.isArray(savedPicross.completedLevels)
    ? [...new Set(savedPicross.completedLevels.filter(level => Number.isInteger(level) && level >= 1 && level <= PICROSS_LEVEL_COUNT))]
    : [];
  const savedUnlock = Number.isInteger(savedPicross.unlockedLevel) ? savedPicross.unlockedLevel : 1;
  const unlockedLevel = Math.max(1, Math.min(PICROSS_LEVEL_COUNT, Math.max(savedUnlock, ...completedLevels.map(level => level + 1))));
  return {
    ...base,
    ...value,
    schemaVersion: 1,
    stats: { ...base.stats, ...(value.stats || {}) },
    achievements: Array.isArray(value.achievements) ? [...new Set(value.achievements)] : [],
    games: {
      ...base.games,
      ...(value.games || {}),
      picross: { ...base.games.picross, ...savedPicross, completedLevels, unlockedLevel },
    },
  };
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function requestStore(mode, action) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, mode);
    const request = action(transaction.objectStore(STORE));
    transaction.oncomplete = () => { database.close(); resolve(request?.result); };
    transaction.onerror = transaction.onabort = () => { database.close(); reject(transaction.error); };
  });
}

export async function loadProfile() {
  try {
    const saved = await requestStore('readonly', store => store.get(PROFILE_KEY));
    if (saved) return normalizeProfile(saved);
  } catch { /* Fall through to the localStorage fallback. */ }
  try { return normalizeProfile(JSON.parse(localStorage.getItem(FALLBACK_KEY))); }
  catch { return createEmptyProfile(); }
}

export async function saveProfile(value) {
  const profile = normalizeProfile(value);
  try { await requestStore('readwrite', store => store.put(profile, PROFILE_KEY)); }
  catch { try { localStorage.setItem(FALLBACK_KEY, JSON.stringify(profile)); } catch { /* Browser storage may be disabled. */ } }
  return profile;
}
