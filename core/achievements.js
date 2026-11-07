import { ARCADE_ACHIEVEMENTS } from './arcade-achievements.js';
import { PICROSS_ACHIEVEMENTS } from '../games/picross/achievements.js';

export const ACHIEVEMENTS = [...ARCADE_ACHIEVEMENTS, ...PICROSS_ACHIEVEMENTS];
const lookup = new Map(ACHIEVEMENTS.map(item => [item.id, item]));
if (lookup.size !== ACHIEVEMENTS.length) throw new Error('Los identificadores de logros deben ser únicos.');

export const achievementIcon = item => item.scope === 'arcade'
  ? `./assets/achievements/${item.id}.svg`
  : `./games/${item.scope}/assets/achievements/${item.id}.svg`;

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
  const earned = items.filter(item => profile.achievements.includes(item.id)).length;
  return { earned, total: items.length, trophies: items.filter(item => item.kind === 'trophy').length };
}

export function getAchievement(id) { return lookup.get(id); }
