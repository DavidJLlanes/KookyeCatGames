import { lineRuns } from './puzzle.js?v=40';

export const MAX_LIVES = 3;
export const POINTS_PER_MISTAKE = 30;
export const TIME_PENALTY = 15;
export const timeLimit = size => size === 10 ? 240 : 90;

const sameRuns = (actual, expected) => String(actual) === String(expected);

export function lineProgress(puzzle, board) {
  const rows = puzzle.rowHints.filter((hint, row) => sameRuns(lineRuns(board[row].map(state => state === 'filled')), hint)).length;
  const columns = puzzle.columnHints.filter((hint, column) => sameRuns(lineRuns(board.map(line => line[column] === 'filled')), hint)).length;
  return { solved: rows + columns, total: puzzle.size * 2 };
}

export function isWrongMove(puzzle, board, row, column, tool) {
  return tool !== 'mark' && board[row][column] !== 'filled' && !puzzle.solution[row][column];
}

export function currentScore(puzzle, board, seconds, mistakes) {
  const { solved, total } = lineProgress(puzzle, board);
  return Math.max(0, Math.round(solved / total * (100 + puzzle.size * 16) - seconds / 2 - mistakes * POINTS_PER_MISTAKE));
}
