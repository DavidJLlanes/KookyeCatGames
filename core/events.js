export const EVENT_VERSION = 1;
const types = new Set(['game_started', 'puzzle_completed', 'cell_filled', 'cell_marked', 'hint_used']);
export function dispatchGameEvent(profile, event, reducers) {
  if (event?.version !== EVENT_VERSION || typeof event.gameId !== 'string' || !types.has(event.type) || !reducers[event.gameId]) {
    throw new Error('Evento de juego incompatible.');
  }
  if (event.type === 'puzzle_completed') {
    const p = event.payload;
    if (!p || typeof p.firstClear !== 'boolean' || !['classic', 'daily', 'timed'].includes(p.mode) ||
        ![5, 10].includes(p.size) || !['duration', 'mistakes', 'hints', 'filledCells', 'emptyCells'].every(key => Number.isFinite(p[key]) && p[key] >= 0)) {
      throw new Error('Resultado de puzle no válido.');
    }
  }
  reducers[event.gameId](profile.games[event.gameId], event);
  return event;
}
