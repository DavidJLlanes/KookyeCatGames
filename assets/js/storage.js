import { GAMES, GAME_BY_ID, newGameProgress } from '../../core/game-registry.js?v=48';
import { ARCADE_ACHIEVEMENTS } from '../../core/arcade-achievements.js?v=48';

const DATABASE = 'kookye-cat-games-local-v2';
const VERSION = 2;
const STORE = 'player-profile';
const PROFILE_KEY = 'local';
const FALLBACK_KEY = 'kcg:profile:v2';

export function createEmptyProfile() {
  return {
    schemaVersion: 2,
    stats: { gamesPlayed: 0, gamesSolved: 0, playSeconds: 0, totalPoints: 0, arcadeXp: 0 },
    arcade: { visits: 0, visitDays: [], exports: 0, imports: 0, sharedCards: 0, modesTried: [], gamesTried: [], gamesMastered: [] },
    achievements: [],
    games: Object.fromEntries(GAMES.map(game => [game.id, newGameProgress(game)])),
  };
}

function mergeProgress(defaults, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
  const next = { ...defaults };
  for (const [key, value] of Object.entries(defaults)) {
    const previous = saved[key];
    if (Array.isArray(value)) next[key] = Array.isArray(previous) ? [...previous] : value;
    else if (value && typeof value === 'object') next[key] = mergeProgress(value, previous);
    else if (previous !== undefined) next[key] = previous;
  }
  return next;
}

export function normalizeProfile(value) {
  const base = createEmptyProfile();
  if (!value || typeof value !== 'object' || value.schemaVersion !== 2) return base;
  return {
    ...base,
    stats: { ...base.stats, ...(value.stats || {}) },
    arcade: mergeProgress(base.arcade, value.arcade),
    achievements: Array.isArray(value.achievements) ? [...new Set(value.achievements)] : [],
    games: Object.fromEntries(GAMES.map(game => [game.id, mergeProgress(base.games[game.id], value.games?.[game.id])])),
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
export function resetGameProgress(profile, gameId) {
  const fresh = GAME_BY_ID.has(gameId) && newGameProgress(GAME_BY_ID.get(gameId));
  if (!fresh || !profile.games?.[gameId]) throw new Error('Juego desconocido.');
  const previous = profile.games[gameId];
  const stats = { ...profile.stats };
  for (const [total, game] of [['gamesPlayed', 'gamesPlayed'], ['gamesSolved', 'solved'], ['playSeconds', 'playedSeconds'], ['totalPoints', 'totalPoints'], ['arcadeXp', 'arcadeXp']]) {
    stats[total] = Math.max(0, (Number(stats[total]) || 0) - (Number(previous[game]) || 0));
  }
  const next = { ...profile, stats, games: { ...profile.games, [gameId]: structuredClone(fresh) } };
  next.arcade = { ...profile.arcade, gamesTried: profile.arcade.gamesTried.filter(id => id !== gameId) };
  next.achievements = profile.achievements.filter(id => {
    if (id.startsWith(`${gameId}-`)) return false;
    const achievement = ARCADE_ACHIEVEMENTS.find(item => item.id === id);
    return !achievement || achievement.metric.split('.').reduce((part, key) => part?.[key], next) >= achievement.target;
  });
  return next;
}
