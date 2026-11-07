import { ARCADE_ACHIEVEMENTS } from './arcade-achievements.js?v=42';
import { GAME_BY_ID, GAMES } from './game-registry.js?v=42';

export const ACHIEVEMENTS = [...ARCADE_ACHIEVEMENTS];
const loaded = new Set();
const pending = new Map();
const lookup = new Map(ACHIEVEMENTS.map(item => [item.id, item]));

export async function loadGameAchievements(gameId) {
  if (loaded.has(gameId)) return ACHIEVEMENTS.filter(item => item.scope === gameId);
  if (pending.has(gameId)) return pending.get(gameId);
  const game = GAME_BY_ID.get(gameId);
  if (!game) throw new Error(`Juego no registrado: ${gameId}`);
  const task = import(game.catalog).then(module => {
    const items = module.ACHIEVEMENTS || module[`${gameId.toUpperCase().replace(/-/g, '_')}_ACHIEVEMENTS`];
    if (!Array.isArray(items) || items.length !== game.awardCount) throw new Error(`Catálogo incompleto: ${gameId}`);
    for (const item of items) {
      if (item.scope !== gameId || lookup.has(item.id) || !/^[a-z0-9-]+$/.test(item.id)) throw new Error(`Premio duplicado o inválido: ${item.id}`);
      lookup.set(item.id, item); ACHIEVEMENTS.push(item);
    }
    loaded.add(gameId);
    return items;
  }).finally(() => pending.delete(gameId));
  pending.set(gameId, task);
  return task;
}
export async function loadAchievementCatalog(gameIds = GAMES.map(game => game.id)) {
  await Promise.all(gameIds.map(loadGameAchievements));
  return ACHIEVEMENTS;
}
export const unloadedGames = () => GAMES.filter(game => !loaded.has(game.id));
export const achievementIcon = item => item.scope === 'arcade'
  ? `./assets/achievements/${item.id}.svg`
  : `${GAME_BY_ID.get(item.scope)?.path || `./games/${item.scope}/`}assets/achievements/${item.id}.svg`;
export function metricValue(profile, path) {
  const value = path.split('.').reduce((part, key) => part?.[key], profile);
  return Array.isArray(value) ? value.length : Number(value) || 0;
}
export function unlockAchievements(profile) {
  const owned = new Set(profile.achievements);
  const earned = ACHIEVEMENTS.filter(item => !owned.has(item.id) && metricValue(profile, item.metric) >= item.target);
  profile.achievements.push(...earned.map(item => item.id));
  return earned;
}
export function getAchievementCounts(profile, scope = null) {
  const items = scope ? ACHIEVEMENTS.filter(item => item.scope === scope) : ACHIEVEMENTS;
  return { earned: items.filter(item => profile.achievements.includes(item.id)).length,
    total: scope ? (GAME_BY_ID.get(scope)?.awardCount ?? items.length) : ARCADE_ACHIEVEMENTS.length + GAMES.reduce((sum, game) => sum + game.awardCount, 0),
    trophies: items.filter(item => item.kind === 'trophy').length };
}
export function getAchievement(id) { return lookup.get(id); }
