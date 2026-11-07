export const PICROSS_METRICS = Object.freeze({
  perfect: 0, lastHeart: 0, noHints: 0, pure: 0, dailyWins: 0,
  timedWins: 0, largeWins: 0, fastWins: 0, filledCells: 0, emptyCells: 0,
});
export function reducePicrossEvent(progress, event) {
  const metrics = progress.metrics;
  const data = event.payload || {};
  if (event.type !== 'puzzle_completed') return;
  if (typeof data.firstClear !== 'boolean' || !['classic', 'daily', 'timed'].includes(data.mode) || ![5, 10].includes(data.size) ||
    !['duration', 'mistakes', 'hints', 'filledCells', 'emptyCells'].every(key => Number.isFinite(data[key]) && data[key] >= 0)) throw new Error('Resultado de Picross no válido.');
  if (!data.firstClear) return;
  metrics.filledCells += data.filledCells;
  metrics.emptyCells += data.emptyCells;
  if (data.mistakes === 0) metrics.perfect++;
  if (data.mistakes === 2) metrics.lastHeart++;
  if (data.hints === 0) metrics.noHints++;
  if (data.mistakes === 0 && data.hints === 0) metrics.pure++;
  if (data.mode === 'daily') metrics.dailyWins++;
  if (data.mode === 'timed') metrics.timedWins++;
  if (data.size === 10) metrics.largeWins++;
  if (data.duration < 60) metrics.fastWins++;
}
import { lineProgress, POINTS_PER_MISTAKE } from './rules.js?v=45';

export function scorePicross(puzzle, board, seconds, mistakes, hints = 0) {
  const { solved, total } = lineProgress(puzzle, board);
  return Math.max(0, Math.round(solved / total * (100 + puzzle.size * 16) - seconds / 2 - mistakes * POINTS_PER_MISTAKE - hints * 10));
}
