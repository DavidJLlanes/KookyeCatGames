/** Solve by intersecting valid row and column placements; never branch or guess. */
const cache = new Map();
const runs = values => {
  const result = []; let count = 0;
  for (const filled of values) {
    if (filled) count++;
    else if (count) { result.push(count); count = 0; }
  }
  if (count) result.push(count);
  return result.length ? result : [0];
};
function placements(hint, size) {
  const key = `${size}:${hint.join(',')}`;
  if (!cache.has(key)) {
    const options = [];
    for (let mask = 0; mask < 2 ** size; mask++) {
      const line = Array.from({ length: size }, (_, index) => Boolean(mask & (1 << index)));
      if (String(runs(line)) === String(hint)) options.push(line);
    }
    cache.set(key, options);
  }
  return cache.get(key);
}

export function logicalSolution(solution) {
  const size = solution.length;
  const rows = solution.map(runs);
  const columns = solution[0].map((_, column) => runs(solution.map(row => row[column])));
  const known = Array.from({ length: size }, () => Array(size).fill(null));
  const steps = [];
  let changed;
  do {
    changed = false;
    for (let axis = 0; axis < 2; axis++) for (let line = 0; line < size; line++) {
      const current = axis ? known.map(row => row[line]) : known[line];
      const options = placements(axis ? columns[line] : rows[line], size)
        .filter(option => option.every((value, index) => current[index] === null || current[index] === value));
      if (!options.length) return { solved: false, steps };
      for (let index = 0; index < size; index++) {
        if (current[index] !== null || !options.every(option => option[index] === options[0][index])) continue;
        const row = axis ? index : line;
        const column = axis ? line : index;
        known[row][column] = options[0][index];
        steps.push({ row, column, filled: options[0][index] });
        changed = true;
      }
    }
  } while (changed);
  return { solved: known.every((row, r) => row.every((value, c) => value === solution[r][c])), steps };
}
