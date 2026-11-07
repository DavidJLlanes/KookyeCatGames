import { logicalSolution } from './logic.js?v=48';

const lineOptions = new Map();
const variantCache = new Map();
const PATTERNS = {
  5: [
    ['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..'],
    ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'],
    ['XXXXX', 'X...X', 'X...X', 'X...X', 'XXXXX'],
    ['..X..', '.XX..', 'XXXXX', '.XX..', '..X..'],
    ['.XXX.', 'X...X', 'XXXXX', '..X..', '..X..'],
    ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
    ['..X..', '.XXX.', 'XXXXX', '..X..', '..X..'],
    ['..X..', '.XXX.', 'XXXXX', 'X...X', 'XXXXX'],
    ['X.X.X', 'XXXXX', '.XXX.', '.X.X.', '.X.X.'],
    ['..XXX', '..X.X', '..XXX', '...X.', 'XXXXX'],
    ['.XXX.', '.X..X', 'XX..X', 'X...X', 'XXXXX'],
    ['X...X', '.....', '..X..', '.X.X.', 'XXXXX'],
    ['..X..', 'XXXXX', '.XXX.', '.XXX.', 'XXXXX'],
    ['...XX', '..XX.', '.XXX.', 'XX...', 'X....'],
    ['..X..', '.XXX.', '..X..', 'X.X.X', '.XXX.'],
    ['XXXXX', 'X...X', 'XXX..', 'X...X', 'XXXXX'],
  ],
  10: [
    ['...XX..XX.', '..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', 'XXXXXXXXXX', '.XXXXXXXX.', '..XXXXXX..', '...XXXX...', '....XX....', '....XX....'],
    ['....XX....', '...XXXX...', '..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', 'XXXXXXXXXX', '...XXXX...', '...XXXX...', '...XXXX...', '....XX....'],
    ['....X.....', '...XX.....', '..XXX.....', '.XXXX.....', 'XXXXXXXXXX', 'XXXXXXXXXX', '.XXXX.....', '..XXX.....', '...XX.....', '....X.....'],
    ['...XXXX...', '..XXXXXX..', '.XX.XX.XX.', 'XX..XX..XX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XX......XX', 'XX......XX', '.XX....XX.', '..XXXXXX..'],
    ['.....X....', '....XXX...', '...XXXXX..', '..XXXXXXX.', '.XXXXXXXXX', 'XXXXXXXXXX', '....XXX...', '....XXX...', '....XXX...', '....XXX...'],
    ['...XXXX...', '..XX..XX..', '.XX....XX.', 'XX......XX', 'XX......XX', '.XX....XX.', '..XX..XX..', '...XXXX...', '....XX....', '....XX....'],
    ['...XXXX...', '..XXXXXX..', '.XX.XX.XX.', 'XXXXXXXXXX', 'XX.XXXX.XX', 'XX.XXXX.XX', '.XXXXXXXX.', '..XXXXXX..', '...X..X...', '..XX..XX..'],
    ['X..X..X..X', 'XX.XXXX.XX', '.XXXXXXXX.', '..XXXXXX..', '....XX....', '..XXXXXX..', '.XXXXXXXX.', 'XX.XXXX.XX', 'X..X..X..X', '....XX....'],
    ['..........', '..XXX.....', '.XXXXX....', 'XXXXXXXX..', '.XXXXX....', '..XXX.....', '...XXXXXX.', '..XXXXXXXX', '...XXXXXX.', '..........'],
    ['....XX....', '...XXXX...', '..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', '..XX..XX..', '..XX..XX..', '.XXX..XXX.', 'XX......XX', 'X........X'],
    ['...XXXX...', '..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', 'XX..XX..XX', '...XXXX...', '...XXXX...', '....XX....', '....XX....', '...XXXX...'],
    ['...XXXX...', '..XX..XX..', '..XXXXXX..', '...XXXX...', '....XX....', '....XX....', '....XX....', '....XX....', '....XX....', '..XXXXXX..'],
    ['....XX....', '..XXXXXX..', '.XXXXXXXX.', '..XXXXXX..', '....XX....', '....XX....', '...XXXX...', '..XXXXXX..', '....XX....', '....XX....'],
    ['....XX....', '...XXXX...', '..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', '....XX....', '....XX....', '....XX....', '..XXXXXX..', '..XXXXXX..'],
    ['....XX....', '...XXXX...', '..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', '...XXXX...', '..XX..XX..', 'XX......XX', 'XXXXXXXXXX', '..........'],
  ],
};

function matrixFromPattern(pattern) {
  return pattern.map(line => [...line].map(cell => cell === 'X'));
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, column) => matrix.map(row => row[column]).reverse());
}

function transformMatrices(matrix) {
  const horizontal = matrix.map(row => [...row].reverse());
  const vertical = [...matrix].reverse().map(row => [...row]);
  const transposed = matrix[0].map((_, column) => matrix.map(row => row[column]));
  return [
    matrix,
    rotateMatrix(matrix),
    rotateMatrix(rotateMatrix(matrix)),
    rotateMatrix(rotateMatrix(rotateMatrix(matrix))),
    horizontal,
    vertical,
    transposed,
    rotateMatrix(rotateMatrix(transposed)),
  ];
}

function collectVariants(size, inverted = false) {
  const cacheKey = `${size}:${inverted}`;
  if (variantCache.has(cacheKey)) return variantCache.get(cacheKey);
  const variants = [];
  const seen = new Set();
  for (const pattern of PATTERNS[size]) {
    const base = matrixFromPattern(pattern).map(row => row.map(cell => inverted ? !cell : cell));
    if (!hasUniqueSolution(base) || !logicalSolution(base).solved) continue;
    for (const transformed of transformMatrices(matrixFromPattern(pattern))) {
      const matrix = transformed.map(row => row.map(cell => inverted ? !cell : cell));
      const key = matrix.map(row => row.map(cell => cell ? '1' : '0').join('')).join('/');
      if (seen.has(key) || !logicalSolution(matrix).solved) continue;
      seen.add(key);
      variants.push(matrix);
    }
  }
  variantCache.set(cacheKey, variants);
  return variants;
}

function campaignGroup(size, count, inverted, groupName) {
  const variants = collectVariants(size, inverted);
  if (variants.length < count) {
    const seen = new Set(variants.map(matrix => matrix.map(row => row.map(cell => cell ? '1' : '0').join('')).join('/')));
    for (const matrix of collectVariants(size, !inverted)) {
      const key = matrix.map(row => row.map(cell => cell ? '1' : '0').join('')).join('/');
      if (seen.has(key)) continue;
      variants.push(matrix);
      seen.add(key);
      if (variants.length === count) break;
    }
  }
  return Array.from({ length: count }, (_, index) => ({
    solution: variants[index % variants.length],
    size,
    group: groupName,
  }));
}

export const CAMPAIGN_LEVELS = [
  ...campaignGroup(5, 20, false, 'Principiante'),
  ...campaignGroup(10, 20, false, 'Intermedio'),
  ...campaignGroup(10, 20, true, 'Avanzado'),
];

export const CAMPAIGN_LEVEL_COUNT = CAMPAIGN_LEVELS.length;

function seededIndex(seed, count) {
  let hash = 2166136261;
  for (const character of String(seed)) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) % count;
}

function getRuns(values) {
  const result = []; let count = 0;
  for (const filled of values) {
    if (filled) count++;
    else if (count) { result.push(count); count = 0; }
  }
  if (count) result.push(count);
  return result.length ? result : [0];
}

function optionsFor(hint, size) {
  const key = `${size}:${hint}`;
  if (!lineOptions.has(key)) {
    const options = [];
    for (let mask = 0; mask < 2 ** size; mask++) {
      const values = Array.from({ length: size }, (_, index) => Boolean(mask & (1 << index)));
      if (String(getRuns(values)) === String(hint)) options.push(values);
    }
    lineOptions.set(key, options);
  }
  return lineOptions.get(key);
}

export function hasUniqueSolution(matrix) {
  const size = matrix.length;
  const rows = matrix.map(row => optionsFor(getRuns(row), size));
  const columns = matrix[0].map((_, c) => optionsFor(getRuns(matrix.map(row => row[c])), size));
  let solutions = 0;
  function search(row, candidates) {
    if (solutions > 1) return;
    if (row === size) { solutions++; return; }
    for (const option of rows[row]) {
      const next = candidates.map((lines, c) => lines.filter(line => line[row] === option[c]));
      if (next.every(lines => lines.length)) search(row + 1, next);
      if (solutions > 1) return;
    }
  }
  search(0, columns);
  return solutions === 1;
}

export function buildPuzzle(size, seed) {
  const variants = collectVariants(size === 10 ? 10 : 5);
  const rows = variants[seededIndex(seed, variants.length)];
  return {
    id: String(seed),
    size: rows.length,
    solution: rows,
    rowHints: rows.map(getRuns),
    columnHints: rows[0].map((_, column) => getRuns(rows.map(row => row[column]))),
  };
}

export function buildCampaignPuzzle(levelNumber) {
  const level = CAMPAIGN_LEVELS[levelNumber - 1];
  if (!level) throw new RangeError('Ese nivel de Picross no existe.');
  const solution = level.solution.map(row => [...row]);
  return {
    id: `level-${levelNumber}`,
    level: levelNumber,
    group: level.group,
    size: level.size,
    solution,
    rowHints: solution.map(getRuns),
    columnHints: solution[0].map((_, column) => getRuns(solution.map(row => row[column]))),
  };
}

export function countFilled(solution) { return solution.flat().filter(Boolean).length; }

export function isSolved(puzzle, board) {
  const rowsSolved = puzzle.rowHints.every((hint, row) => JSON.stringify(lineRuns(board[row].map(state => state === 'filled'))) === JSON.stringify(hint));
  const columnsSolved = puzzle.columnHints.every((hint, column) => JSON.stringify(lineRuns(board.map(line => line[column] === 'filled'))) === JSON.stringify(hint));
  return rowsSolved && columnsSolved;
}

export function lineRuns(values) { return getRuns(values); }
