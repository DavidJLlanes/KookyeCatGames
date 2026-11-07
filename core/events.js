import { GAME_BY_ID } from './game-registry.js?v=43';
export const EVENT_VERSION = 1;
export function dispatchGameEvent(profile, event, reducers) {
  if (event?.version !== EVENT_VERSION || !GAME_BY_ID.has(event.gameId) || !/^[a-z][a-z0-9_]*$/.test(event.type || '') ||
      !event.payload || typeof event.payload !== 'object' || !reducers[event.gameId] || !profile.games?.[event.gameId]) {
    throw new Error('Evento de juego incompatible.');
  }
  reducers[event.gameId](profile.games[event.gameId], event);
  if (event.type === 'game_started') {
    const games = profile.arcade.gamesTried;
    if (!games.includes(event.gameId)) games.push(event.gameId);
    const mode = `${event.gameId}:${event.payload.mode}`;
    if (event.payload.mode && !profile.arcade.modesTried.includes(mode)) profile.arcade.modesTried.push(mode);
  }
  if (event.type === 'game_mastered' && !profile.arcade.gamesMastered.includes(event.gameId)) profile.arcade.gamesMastered.push(event.gameId);
  return event;
}
export function dispatchArcadeEvent(profile, event) {
  if (event?.version !== EVENT_VERSION || event.scope !== 'arcade' || !['visit', 'export', 'import', 'share'].includes(event.type)) {
    throw new Error('Evento de arcade incompatible.');
  }
  const arcade = profile.arcade;
  if (event.type === 'visit') {
    arcade.visits++;
    if (typeof event.date === 'string' && !arcade.visitDays.includes(event.date)) arcade.visitDays.push(event.date);
  } else if (event.type === 'export') arcade.exports++;
  else if (event.type === 'import') arcade.imports++;
  else arcade.sharedCards++;
  return event;
}
export function recordArcadeAction(profile, action, date = new Date().toLocaleDateString('en-CA')) {
  return dispatchArcadeEvent(profile, { version: EVENT_VERSION, scope: 'arcade', type: action, date });
}
