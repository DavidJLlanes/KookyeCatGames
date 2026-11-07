export const WIDTH = 440, HEIGHT = 640, RADIUS = 20, STEP = Math.sqrt(3) * RADIUS;
export const CANNON = { x: 220, y: 594 }, LIMIT = 510, MISS_LIMIT = 6;
export const COLORS = ['#e64f86', '#277ed5', '#17856b', '#af6bd5', '#c07b12', '#df5d34'];
export const SYMBOLS = ['♥', '●', '✚', '◆', '★', '▲'];
export const LEVELS = Array.from({ length: 60 }, (_, i) => ({
  number: i + 1, rows: 4 + Math.floor(i / 12), colors: Math.min(6, 3 + Math.floor(i / 15)),
  seed: hash(`bubbleshooter:campaign:${i + 1}`), chapter: ['Primeras burbujas', 'Rebotes de coral', 'Jardín suspendido', 'Órbita violeta', 'Cielo de leyenda'][Math.floor(i / 12)],
}));
export function hash(value) { let h = 2166136261; for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
export function random(state) { state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0; return state.seed / 4294967296; }
export const key = (r, c) => `${r}:${c}`;
export const columns = r => r % 2 ? 9 : 10;
export const position = (r, c, drop = 0) => ({ x: 40 + 40 * c + (r % 2) * 20, y: 24 + STEP * (r + drop) });
export function neighbors(r, c) {
  const shift = r % 2 ? 1 : -1;
  return [[r,c-1],[r,c+1],[r-1,c],[r-1,c+shift],[r+1,c],[r+1,c+shift]]
    .filter(([row,col]) => row >= 0 && row < 15 && col >= 0 && col < columns(row));
}
export const clampAngle = angle => Math.max(-1.38, Math.min(1.38, angle));
export const aimAt = (x, y) => clampAngle(Math.atan2(x - CANNON.x, Math.max(35, CANNON.y - y)));
export function configuration(mode, level = 1, date = localDate(), seed = Date.now()) {
  if (mode === 'classic') return { ...LEVELS[level - 1], mode, id: `level:${level}`, name: `Nivel ${String(level).padStart(2,'0')}` };
  return { mode, number: 0, id: mode === 'daily' ? `daily:${date}` : `timed:${seed}`, name: mode === 'daily' ? 'Reto diario' : 'Contrarreloj',
    chapter: mode === 'daily' ? date : '120 segundos · despeja el cielo', rows: mode === 'daily' ? 7 : 6, colors: 5,
    seed: hash(mode === 'daily' ? `bubbles:${date}` : String(seed)) };
}
export function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
