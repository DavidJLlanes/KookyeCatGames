import {RADIUS, STEP, CANNON, LIMIT, MISS_LIMIT, columns, position, neighbors, key, random, clampAngle} from './rules.js?v=48';

export function availableColors(game) { return [...new Set(game.board.map(b => b.color))].sort(); }
export function nextColor(game) { const colors = availableColors(game); return colors[Math.floor(random(game) * colors.length)] ?? 0; }
export function newGame(config) {
  const game = { config, seed: config.seed, board: [], drop: 0, misses: 0, shots: 0, popped: 0, fallen: 0,
    banks: 0, bestCombo: 0, combo: 0, score: 0, elapsed: 0, hits: 0, counted: false, finished: false, swapped: false };
  // Small color runs create openings; every color in the launcher exists on the board.
  for (let r = 0; r < config.rows; r++) for (let c = 0; c < columns(r); c++) {
    const color = c % 3 === 0 ? Math.floor(random(game) * config.colors) : game.board.at(-1).color;
    game.board.push({r,c,color});
  }
  game.current = nextColor(game); game.next = nextColor(game);
  return game;
}
export function swap(game) {
  if (game.finished || game.swapped) return false;
  [game.current, game.next] = [game.next, game.current]; game.swapped = true; return true;
}
export function launch(game, angle) {
  if (game.finished) return null;
  angle = clampAngle(angle);
  return { x: CANNON.x, y: CANNON.y, vx: Math.sin(angle)*840, vy: -Math.cos(angle)*840, color: game.current, banks: 0 };
}
function flood(board, start, sameColor) {
  const lookup = new Map(board.map(b => [key(b.r,b.c), b])), visited = new Set(), stack = [...start];
  while (stack.length) {
    const cell = stack.pop(), id = key(cell.r,cell.c);
    if (visited.has(id)) continue;
    visited.add(id);
    for (const [r,c] of neighbors(cell.r,cell.c)) {
      const next = lookup.get(key(r,c));
      if (next && (!sameColor || next.color === cell.color) && !visited.has(key(r,c))) stack.push(next);
    }
  }
  return visited;
}
export function attach(game, shot, hit = null) {
  const occupied = new Set(game.board.map(b => key(b.r,b.c)));
  const candidates = (hit ? neighbors(hit.r,hit.c) : Array.from({length: columns(0)}, (_,c)=>[0,c]))
    .filter(([r,c]) => !occupied.has(key(r,c)))
    .map(([r,c]) => ({r,c,d: Math.hypot(position(r,c,game.drop).x-shot.x,position(r,c,game.drop).y-shot.y)}))
    .sort((a,b)=>a.d-b.d);
  if (!candidates.length) return { lost: true, popped: 0, fallen: 0, bank: false };
  const {r,c} = candidates[0], cell = {r,c,color:shot.color}; game.board.push(cell); game.shots++;
  const cluster = flood(game.board,[cell],true);
  let popped = 0, fallen = 0;
  if (cluster.size >= 3) {
    popped = cluster.size;
    game.board = game.board.filter(b => !cluster.has(key(b.r,b.c)));
    const connected = flood(game.board,game.board.filter(b => b.r===0),false);
    fallen = game.board.length-connected.size;
    game.board = game.board.filter(b => connected.has(key(b.r,b.c)));
    game.combo++; game.bestCombo = Math.max(game.bestCombo,game.combo);
    game.popped += popped; game.fallen += fallen;
    if (shot.banks) game.banks++;
    game.score += popped*10 + fallen*25 + Math.min(10,game.combo)*15 + (shot.banks ? 30 : 0);
  } else {
    game.combo = 0; game.misses++;
    if (game.misses === MISS_LIMIT) { game.misses = 0; game.drop++; }
  }
  game.swapped = false;
  const colors = availableColors(game);
  game.current = colors.includes(game.next) ? game.next : nextColor(game);
  game.next = nextColor(game);
  return {popped,fallen,bank: Boolean(popped && shot.banks),won: !game.board.length,
    lost: game.board.some(b => position(b.r,b.c,game.drop).y+RADIUS >= LIMIT)};
}
// Substeps keep collision detection reliable even on slow mobile frames.
export function advance(game, shot, seconds) {
  const steps = Math.max(1,Math.ceil(seconds*840/7)), dt = seconds/steps;
  for (let i=0;i<steps;i++) {
    shot.x += shot.vx*dt; shot.y += shot.vy*dt;
    if (shot.x < 40) { shot.x = 80-shot.x; shot.vx = Math.abs(shot.vx); shot.banks++; }
    if (shot.x > 400) { shot.x = 800-shot.x; shot.vx = -Math.abs(shot.vx); shot.banks++; }
    const hit = game.board.find(b => {const p=position(b.r,b.c,game.drop); return Math.hypot(p.x-shot.x,p.y-shot.y)<=RADIUS*2-.5;});
    if (hit || shot.y <= 24+STEP*game.drop) return attach(game,shot,hit);
  }
  return null;
}
export function validGame(game) {
  return game && !game.finished && ['classic','timed','daily'].includes(game.config?.mode) &&
    Number.isInteger(game.config.number) && game.config.number >= 0 && game.config.number <= 60 &&
    (game.config.mode !== 'classic' || game.config.id === `level:${game.config.number}` && game.config.number > 0) &&
    Array.isArray(game.board) && game.board.length > 0 && game.board.length <= 150 &&
    game.board.every(b => Number.isInteger(b.r)&&b.r>=0&&b.r<15&&Number.isInteger(b.c)&&b.c>=0&&b.c<columns(b.r)&&Number.isInteger(b.color)&&b.color>=0&&b.color<6) &&
    new Set(game.board.map(b=>key(b.r,b.c))).size === game.board.length &&
    ['seed','drop','misses','shots','popped','fallen','banks','bestCombo','combo','score','elapsed','current','next'].every(k=>Number.isInteger(game[k])&&game[k]>=0) &&
    game.drop < 15 && game.misses < MISS_LIMIT && game.current < 6 && game.next < 6 &&
    (!game.flight || ['x','y','vx','vy','color','banks'].every(k=>Number.isFinite(game.flight[k])) &&
      game.flight.x>=33 && game.flight.x<=407 && game.flight.y>=0 && game.flight.y<=CANNON.y &&
      Math.abs(game.flight.vx)<=840 && game.flight.vy<0 && game.flight.vy>=-840 &&
      Number.isInteger(game.flight.color) && game.flight.color>=0 && game.flight.color<6);
}
