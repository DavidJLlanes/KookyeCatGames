import { MAX_LIVES, TIME_PENALTY, timeLimit, lineProgress, isWrongMove, currentScore } from './rules.js?v=16';
import { attachBoardGesture } from './gesture.js?v=16';
import { ACHIEVEMENTS, getAchievementCounts, unlockAchievements } from '../../assets/js/achievements.js?v=16';
import { loadProfile, saveProfile, resetGameProgress } from '../../assets/js/storage.js?v=16';
import { makeShareCard, shareOrSave } from '../../assets/js/share-card.js';
import { buildPuzzle, buildCampaignPuzzle, CAMPAIGN_LEVELS, CAMPAIGN_LEVEL_COUNT, isSolved, lineRuns } from './puzzle.js?v=16';
import { downloadZip } from '../../assets/js/zip.js';
import { exportGameBackup, restoreBackup } from '../../assets/js/backups.js';
import { logicalSolution } from './logic.js?v=16';

const $ = selector => document.querySelector(selector);
const boardRoot = $('#nonogram');
const wrongTimers = new WeakMap();
function showCellError(cell) {
  if (!cell) return;
  clearTimeout(wrongTimers.get(cell));
  cell.classList.remove('wrong');
  void cell.offsetWidth;
  cell.classList.add('wrong');
  cell.setAttribute('aria-invalid', 'true');
  wrongTimers.set(cell, setTimeout(() => {
    cell.classList.remove('wrong');
    cell.removeAttribute('aria-invalid');
  }, 2000));
}
const localDate = () => new Date().toLocaleDateString('en-CA');
const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

let profile;
let mode = 'classic';
let size = 5;
let activeLevel = 1;
let tool = 'fill';
let puzzle;
let board;
let mistakes = 0;
let elapsed = 0;
let startedAt = Date.now();
let playing = false;
let completed = false;
let counted = false;
let focusIndex = 0;
let lastSave = 0;
let lastClearedLevel = 0;
let saveQueue = Promise.resolve();
let advanceTimer;

function persistProfile() {
  const snapshot = structuredClone(profile);
  saveQueue = saveQueue.catch(() => {}).then(() => saveProfile(snapshot));
  return saveQueue;
}

function notify(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('visible');
  clearTimeout(notify.timeout); notify.timeout = setTimeout(() => toast.classList.remove('visible'), 2500);
}

function secondsPlayed() {
  return elapsed + (playing ? Math.floor((Date.now() - startedAt) / 1000) : 0);
}

function createEmptyBoard() {
  return Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill('empty'));
}

function renderBoard() {
  const count = puzzle.size;
  boardRoot.style.setProperty('--size', count);
  const corner = '<div class="grid-corner" aria-hidden="true">◈</div>';
  const columns = `<div class="column-hints">${puzzle.columnHints.map((hint, column) => `<div class="hint vertical" data-column-hint="${column}">${hint.map(value => `<span>${value}</span>`).join('')}</div>`).join('')}</div>`;
  const rows = `<div class="row-hints">${puzzle.rowHints.map((hint, row) => `<div class="hint horizontal" data-row-hint="${row}">${hint.map(value => `<span>${value}</span>`).join('')}</div>`).join('')}</div>`;
  const cells = `<div class="cell-grid ${count === 10 ? 'break-five' : ''}">${board.map((line, row) => line.map((state, column) => {
    const label = state === 'filled' ? 'rellena' : state === 'marked' ? 'marcada vacía' : 'sin marcar';
    const index = row * count + column;
    return `<button class="cell" type="button" data-row="${row}" data-column="${column}" data-state="${state}" aria-label="Fila ${row + 1}, columna ${column + 1}, ${label}" aria-pressed="${state !== 'empty'}" tabindex="${index === focusIndex ? '0' : '-1'}"></button>`;
  }).join('')).join('')}</div>`;
  boardRoot.innerHTML = corner + columns + rows + cells;
  updateProgress(); updateHintStates();
}

function updateHintStates() {
  for (let row = 0; row < puzzle.size; row++) {
    const actual = lineRuns(board[row].map(state => state === 'filled'));
    const done = JSON.stringify(actual) === JSON.stringify(puzzle.rowHints[row]);
    boardRoot.querySelector(`[data-row-hint="${row}"]`)?.classList.toggle('complete', done);
  }
  for (let column = 0; column < puzzle.size; column++) {
    const actual = lineRuns(board.map(line => line[column] === 'filled'));
    const done = JSON.stringify(actual) === JSON.stringify(puzzle.columnHints[column]);
    boardRoot.querySelector(`[data-column-hint="${column}"]`)?.classList.toggle('complete', done);
  }
}

function scoreNow() {
  return currentScore(puzzle, board, secondsPlayed(), mistakes);
}

function updateProgress() {
  const filled = board.flat().filter(state => state === 'filled').length;
  const marked = board.flat().filter(state => state === 'marked').length;
  const { solved, total } = lineProgress(puzzle, board);
  const percent = Math.round(solved / total * 100);
  $('#filled-count').textContent = filled;
  const remaining = Math.max(0, MAX_LIVES - mistakes);
  $('#hearts').innerHTML = Array.from({ length: MAX_LIVES }, (_, index) => `<span class="heart ${index < remaining ? '' : 'lost'}">♥</span>`).join('');
  $('#lives-label').textContent = `${remaining} de ${MAX_LIVES} vidas`;
  $('#marked-count').textContent = marked;
  $('#progress-label').textContent = `${percent}%`;
  $('#progress-bar').style.width = `${percent}%`;
  $('#live-score').textContent = `${scoreNow()} pts`;
  $('#score-bar').style.width = `${Math.min(100, scoreNow() / (100 + puzzle.size * 16) * 100)}%`;
  $('#completed-lines').textContent = `${solved} / ${total}`;
  const left = mode === 'timed' ? Math.max(0, timeLimit(size) - secondsPlayed()) : secondsPlayed();
  $('#timer').textContent = formatTime(left);
}

function renderPlayerStats() {
  const stats = profile.games.picross;
  $('#best-score').textContent = stats.bestScore.toLocaleString('es-ES');
  $('#solved-count').textContent = stats.solved;
  $('#played-count').textContent = stats.gamesPlayed;
  $('#best-time').textContent = stats.bestTime == null ? '—' : formatTime(stats.bestTime);
  const unlocked = new Set(profile.achievements);
  const next = ACHIEVEMENTS.find(item => !unlocked.has(item.id));
  $('#next-trophy').textContent = next?.name || '¡Colección completa!';
  $('#next-detail').textContent = next?.detail || 'Has desbloqueado todos los trofeos disponibles.';
  const counts = getAchievementCounts(profile);
  $('#trophy-count').textContent = `${counts.earned} / ${counts.total} trofeos`;
  renderCampaignPicker();
}

function renderCampaignPicker() {
  const progress = profile.games.picross;
  const completed = new Set(progress.completedLevels || []);
  $('#level-select').innerHTML = CAMPAIGN_LEVELS.map((level, index) => {
    const number = index + 1;
    const locked = number > progress.unlockedLevel;
    const state = completed.has(number) ? ' · Superado' : locked ? ' · Bloqueado' : '';
    return `<option value="${number}" ${locked ? 'disabled' : ''}>${String(number).padStart(2, '0')} · ${level.group} · ${level.size}×${level.size}${state}</option>`;
  }).join('');
  const selectedLevel = mode === 'classic' && activeLevel > 0
    ? Math.max(1, Math.min(activeLevel, progress.unlockedLevel))
    : progress.unlockedLevel;
  if (mode === 'classic' && activeLevel > 0) activeLevel = selectedLevel;
  $('#level-select').value = String(selectedLevel);
  $('#campaign-progress').textContent = `${completed.size} / ${CAMPAIGN_LEVEL_COUNT} superados`;
}

function updatePuzzleLabel(resumed = false) {
  if (mode === 'daily') $('#puzzle-label').textContent = `RETO DIARIO · ${localDate()}`;
  else if (mode === 'classic' && activeLevel > 0) {
    const label = `NIVEL ${String(activeLevel).padStart(2, '0')} / ${CAMPAIGN_LEVEL_COUNT} · ${puzzle.group.toUpperCase()}`;
    $('#puzzle-label').textContent = resumed ? `EN CURSO · ${label}` : label;
  } else $('#puzzle-label').textContent = resumed ? `PARTIDA EN CURSO · ${size} × ${size}` : `PUZLE ${size} × ${size}`;
}

async function saveActive() {
  profile.games.picross.active = completed ? null : {
    id: puzzle.id, mode, level: mode === 'classic' && activeLevel > 0 ? activeLevel : null,
    size, board, mistakes, elapsed: secondsPlayed(), counted, date: localDate(), rulesVersion: 3,
  };
  await persistProfile();
  lastSave = Date.now();
}

function updateModeUI() {
  const campaign = mode === 'classic' && activeLevel > 0;
  $('#level-picker').hidden = !campaign;
  $('#size-picker').hidden = !(mode === 'timed' || (mode === 'classic' && !campaign));
  $('#new-puzzle').hidden = campaign;
  document.querySelectorAll('[data-mode]').forEach(button => button.classList.toggle('selected', button.dataset.mode === mode));
  document.querySelectorAll('[data-size]').forEach(button => {
    button.disabled = mode === 'daily' || campaign;
    button.classList.toggle('selected', Number(button.dataset.size) === size);
  });
  $('#mode-label').textContent = mode === 'classic' ? (campaign ? 'CAMPAÑA' : 'CLÁSICO') : mode === 'timed' ? 'CONTRARRELOJ' : 'RETO DIARIO';
  if (campaign) renderCampaignPicker();
}

function startPuzzle(seed = Date.now(), isResume = false) {
  clearTimeout(advanceTimer);
  if (mode === 'daily') size = 10;
  puzzle = mode === 'classic' && activeLevel > 0 ? buildCampaignPuzzle(activeLevel) : buildPuzzle(size, seed);
  size = puzzle.size;
  board = createEmptyBoard(); mistakes = 0; elapsed = 0; focusIndex = 0; completed = false;
  startedAt = Date.now(); playing = true;
  $('#win-overlay').hidden = true;
  $('#lose-overlay').hidden = true;
  updatePuzzleLabel();
  $('#daily-caption').textContent = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  updateModeUI(); renderBoard();
  if (!counted && !isResume) {
    profile.stats.gamesPlayed++;
    profile.games.picross.gamesPlayed++;
    counted = true;
    unlockAchievements(profile);
  }
  renderPlayerStats(); saveActive();
}

function setTool(nextTool) {
  tool = nextTool;
  document.querySelectorAll('[data-tool]').forEach(button => {
    button.classList.toggle('selected', button.dataset.tool === tool);
    button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
  });
}

async function clickCell(row, column, selectedTool = tool, isStroke = false) {
  if (!playing || completed) return;
  const previous = board[row][column];
  const next = selectedTool === 'mark' ? 'marked' : 'filled';
  const targetCell = boardRoot.querySelector(`[data-row="${row}"][data-column="${column}"]`);
  if (isStroke && previous === next) return;
  if (isWrongMove(puzzle, board, row, column, selectedTool)) {
    mistakes++;
    if (mode === 'timed') elapsed += TIME_PENALTY;
    showCellError(targetCell);
    notify(`Fallo: esa casilla queda vacía. Te quedan ${Math.max(0, MAX_LIVES - mistakes)} vidas.`);
    updateProgress();
    if (mistakes >= MAX_LIVES) finishAttempt('lives');
    else checkTimeLimit();
    await saveActive();
    return;
  }
  board[row][column] = previous === next ? 'empty' : next;
  focusIndex = row * puzzle.size + column;
  const cell = boardRoot.querySelector(`[data-row="${row}"][data-column="${column}"]`);
  if (cell) {
    cell.dataset.state = board[row][column];
    cell.setAttribute('aria-pressed', String(board[row][column] !== 'empty'));
    cell.setAttribute('aria-label', `Fila ${row + 1}, columna ${column + 1}, ${board[row][column] === 'filled' ? 'rellena' : board[row][column] === 'marked' ? 'marcada vacía' : 'sin marcar'}`);
    boardRoot.querySelectorAll('.cell').forEach(item => item.tabIndex = item === cell ? 0 : -1);
    if (board[row][column] === 'marked' && puzzle.solution[row][column]) showCellError(cell);
  }
  updateProgress(); updateHintStates();
  if (isSolved(puzzle, board)) await completePuzzle();
  else await saveActive();
}

async function completePuzzle() {
  const duration = Math.max(0, Math.floor(elapsed + (Date.now() - startedAt) / 1000));
  completed = true; playing = false; elapsed = duration;
  const earnedPoints = scoreNow();
  const stats = profile.games.picross;
  const completedLevel = mode === 'classic' ? activeLevel : 0;
  lastClearedLevel = completedLevel;
  const puzzleId = mode === 'daily' ? `daily:${localDate()}` : completedLevel > 0 ? `level:${completedLevel}` : `${mode}:${size}:${puzzle.id}`;
  const firstClear = !stats.completedPuzzles.includes(puzzleId);
  if (firstClear) { stats.solved++; stats.completedPuzzles.push(puzzleId); }
  if (completedLevel > 0 && firstClear) {
    stats.completedLevels = [...new Set([...stats.completedLevels, completedLevel])].sort((a, b) => a - b);
    stats.unlockedLevel = Math.min(CAMPAIGN_LEVEL_COUNT, Math.max(stats.unlockedLevel, completedLevel + 1));
  }
  stats.bestScore = Math.max(stats.bestScore, earnedPoints);
  stats.bestTime = stats.bestTime == null ? duration : Math.min(stats.bestTime, duration);
  profile.stats.gamesSolved += firstClear ? 1 : 0;
  profile.stats.playSeconds += duration;
  profile.stats.totalPoints += firstClear ? earnedPoints : 0;
  stats.playedSeconds += duration;
  stats.totalPoints += firstClear ? earnedPoints : 0;
  const newTrophies = unlockAchievements(profile);
  profile.games.picross.active = null;
  await persistProfile();
  renderPlayerStats(); updateProgress();
  $('#win-message').textContent = `+${earnedPoints} puntos · ${formatTime(duration)}`;
  $('#next-puzzle').textContent = mode === 'classic' && completedLevel === CAMPAIGN_LEVEL_COUNT
    ? 'Repetir nivel 60'
    : mode === 'classic' && completedLevel > 0
      ? `Siguiente nivel ${String(Math.min(completedLevel + 1, CAMPAIGN_LEVEL_COUNT)).padStart(2, '0')}`
      : 'Siguiente puzle →';
  $('#win-overlay').hidden = false;
  if (completedLevel > 0 && completedLevel < CAMPAIGN_LEVEL_COUNT) {
    $('#win-message').textContent += ' · Siguiente nivel en 3 segundos';
    advanceTimer = setTimeout(() => {
      if (completed && mode === 'classic' && activeLevel === completedLevel) advancePuzzle();
    }, 3000);
  }
  if (newTrophies.length) notify(`Trofeo desbloqueado: ${newTrophies[0].name}`);
}

function selectMode(nextMode) {
  mode = nextMode;
  activeLevel = mode === 'classic' ? profile.games.picross.unlockedLevel : 0;
  if (mode === 'daily') size = 10;
  counted = false;
  updateModeUI();
  const seed = mode === 'daily' ? `daily:${localDate()}` : Date.now();
  startPuzzle(seed);
}

function selectCampaignLevel(levelNumber) {
  mode = 'classic';
  activeLevel = Math.max(1, Math.min(Number(levelNumber) || 1, profile.games.picross.unlockedLevel));
  counted = false;
  startPuzzle();
}

function advancePuzzle() {
  if (mode === 'classic' && lastClearedLevel > 0) {
    selectCampaignLevel(Math.min(CAMPAIGN_LEVEL_COUNT, lastClearedLevel + 1));
  } else selectMode(mode);
}

function restartBoard() {
  clearTimeout(advanceTimer);
  completed = false; lastClearedLevel = 0;
  board = createEmptyBoard(); mistakes = 0; elapsed = 0; startedAt = Date.now(); playing = true; focusIndex = 0;
  $('#lose-overlay').hidden = true; $('#win-overlay').hidden = true;
  updatePuzzleLabel();
  renderBoard(); saveActive();
}

function restoreGame(active) {
  mode = active.mode;
  const savedLevel = Number.isInteger(active.level) ? active.level : 0;
  activeLevel = savedLevel >= 1 && savedLevel <= profile.games.picross.unlockedLevel ? savedLevel : 0;
  size = active.size; counted = true; elapsed = active.elapsed || 0; mistakes = active.mistakes || 0;
  puzzle = mode === 'classic' && activeLevel > 0 ? buildCampaignPuzzle(activeLevel) : buildPuzzle(size, active.id);
  size = puzzle.size; board = active.board; startedAt = Date.now(); playing = true; completed = false;
  updateModeUI();
  updatePuzzleLabel(true);
  renderBoard();
  if (mistakes >= MAX_LIVES) finishAttempt('lives');
  else checkTimeLimit();
}

function finishAttempt(reason) {
  if (!playing) return;
  elapsed = secondsPlayed();
  playing = false;
  $('#lose-title').textContent = reason === 'lives' ? 'Te has quedado sin vidas' : 'Se acabó el tiempo';
  $('#lose-message').textContent = reason === 'lives' ? 'Cada error cuesta un corazón. Respira, mira las pistas y vuelve a intentarlo.' : 'El reloj ha llegado a cero. ¡A por otro intento!';
  $('#lose-overlay').hidden = false;
  updateProgress();
}

function checkTimeLimit() {
  if (playing && mode === 'timed' && secondsPlayed() >= timeLimit(size)) finishAttempt('time');
}

attachBoardGesture(boardRoot, () => tool, clickCell);
boardRoot.addEventListener('contextmenu', event => {
  const cell = event.target.closest('.cell');
  if (!cell) return;
  event.preventDefault(); clickCell(Number(cell.dataset.row), Number(cell.dataset.column), 'mark');
});
boardRoot.addEventListener('keydown', event => {
  const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
  if (moves[event.key]) {
    event.preventDefault();
    const row = Math.floor(focusIndex / puzzle.size); const column = focusIndex % puzzle.size;
    const nextRow = Math.max(0, Math.min(puzzle.size - 1, row + moves[event.key][0]));
    const nextColumn = Math.max(0, Math.min(puzzle.size - 1, column + moves[event.key][1]));
    focusIndex = nextRow * puzzle.size + nextColumn;
    boardRoot.querySelector(`[data-row="${nextRow}"][data-column="${nextColumn}"]`)?.focus();
  } else if (event.key.toLowerCase() === 'x') setTool('mark');
  else if (event.key.toLowerCase() === 'f') setTool('fill');
  else if (event.key === 'Escape') location.href = '../../';
});

document.querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => selectMode(button.dataset.mode)));
document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {
  if (button.disabled) return;
  size = Number(button.dataset.size); activeLevel = 0; counted = false; updateModeUI(); startPuzzle(Date.now());
}));
$('#level-select').addEventListener('change', event => selectCampaignLevel(event.target.value));
$('#new-puzzle').addEventListener('click', () => selectMode(mode));
$('#next-puzzle').addEventListener('click', advancePuzzle);
$('#clear-board').addEventListener('click', restartBoard);
$('#retry-puzzle').addEventListener('click', restartBoard);
$('#mobile-clear').addEventListener('click', restartBoard);
$('#logical-hint').addEventListener('click', () => {
  if (!playing || completed) return;
  const step = logicalSolution(puzzle.solution).steps.find(({ row, column, filled }) =>
    board[row][column] !== (filled ? 'filled' : 'marked') && (filled || board[row][column] !== 'empty'));
  if (!step) { notify('Revisa las pistas: ya no quedan casillas rellenas por deducir.'); return; }
  const cell = boardRoot.querySelector(`[data-row="${step.row}"][data-column="${step.column}"]`);
  cell?.classList.remove('logical-hint');
  if (cell) { void cell.offsetWidth; cell.classList.add('logical-hint'); setTimeout(() => cell.classList.remove('logical-hint'), 2400); }
  notify(`Pista: observa la fila ${step.row + 1} y la columna ${step.column + 1}. Esa casilla ${step.filled ? 'se rellena' : 'está vacía'}.`);
});
const resetProgressButton = $('#reset-game-progress');
let resetArmed = false;
let resetArmedTimer;
resetProgressButton.addEventListener('click', async () => {
  if (!resetArmed) {
    resetArmed = true;
    resetProgressButton.textContent = 'Confirmar: borrar niveles, récords y trofeos';
    resetProgressButton.classList.add('armed');
    clearTimeout(resetArmedTimer);
    resetArmedTimer = setTimeout(() => {
      resetArmed = false;
      resetProgressButton.textContent = 'Borrar todo mi progreso de Picross';
      resetProgressButton.classList.remove('armed');
    }, 10000);
    return;
  }
  clearTimeout(resetArmedTimer);
  resetArmed = false;
  resetProgressButton.disabled = true;
  playing = false;
  clearTimeout(advanceTimer);
  await saveQueue.catch(() => {});
  try {
    const emptyProfile = resetGameProgress(profile, 'picross');
    await saveProfile(emptyProfile);
    profile = await loadProfile();
    if (profile.games.picross.unlockedLevel !== 1 || profile.games.picross.completedLevels.length) throw new Error('No se guardó el borrado.');
    saveQueue = Promise.resolve();
    mode = 'classic'; activeLevel = 1; size = 5; counted = false; lastClearedLevel = 0;
    startPuzzle(Date.now(), true);
    notify('Progreso de Picross eliminado. Comienzas desde el nivel 1.');
  } catch {
    playing = true; startedAt = Date.now();
    notify('No se pudo borrar el progreso. Inténtalo de nuevo.');
  } finally {
    resetProgressButton.disabled = false;
    resetProgressButton.textContent = 'Borrar todo mi progreso de Picross';
    resetProgressButton.classList.remove('armed');
  }
});
$('#export-game').addEventListener('click', async () => {
  const achievements = profile.achievements.filter(id => ACHIEVEMENTS.some(item => item.id === id && item.scope === 'picross'));
  downloadZip(await exportGameBackup('picross', profile.games.picross, achievements), 'picross.zip');
  notify('Backup de Picross guardado.');
});
$('#import-game').addEventListener('click', () => $('#import-game-file').click());
$('#import-game-file').addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (!window.confirm('El backup reemplazará el progreso de Picross en este dispositivo. ¿Continuar?')) return;
    await restoreBackup(file, profile, saveProfile, ['picross'], 'game');
    notify('Progreso de Picross restaurado.');
    setTimeout(() => location.reload(), 650);
  } catch (error) {
    notify(error.message || 'No se pudo restaurar el backup.');
  } finally {
    event.target.value = '';
  }
});
$('#share-game').addEventListener('click', async () => {
  const stats = profile.games.picross;
  const trophies = ACHIEVEMENTS.filter(item => profile.achievements.includes(item.id)).map(item => item.name).slice(-3);
  const image = await makeShareCard({ title: 'Picross', subtitle: `MI RÉCORD · ${stats.solved} RESUELTOS`, score: stats.bestScore.toLocaleString('es-ES'), trophies });
  if (await shareOrSave(image, 'picross-logros.png') === 'saved') notify('Tarjeta guardada como imagen.');
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) { elapsed = secondsPlayed(); playing = false; saveActive(); }
  else if (!document.hidden && !completed && puzzle && mistakes < MAX_LIVES && !(mode === 'timed' && elapsed >= timeLimit(size))) { startedAt = Date.now(); playing = true; }
});

profile = await loadProfile();
renderPlayerStats();
const active = profile.games.picross.active;
const validBoard = Array.isArray(active?.board) && [5, 10].includes(active.size) && active.board.length === active.size &&
  active.board.every(row => Array.isArray(row) && row.length === active.size && row.every(cell => ['empty', 'filled', 'marked'].includes(cell)));
if ((active?.rulesVersion === 2 || active?.rulesVersion === 3) && validBoard && (active.mode !== 'daily' || active.date === localDate())) {
  try { restoreGame(active); } catch { puzzle = null; board = null; profile.games.picross.active = null; }
}
if (!puzzle || !board) { mode = 'classic'; activeLevel = profile.games.picross.unlockedLevel; size = 5; counted = false; startPuzzle(Date.now()); }

import('../../assets/js/pwa-update.js?v=16')
  .then(({ enablePwaUpdates }) => enablePwaUpdates('../../sw.js', notify, async () => { if (playing) await saveActive(); }))
  .catch(() => {});

setInterval(() => {
  if (!puzzle || !board) return;
  if (playing && mode === 'timed' && secondsPlayed() >= timeLimit(size)) {
    checkTimeLimit(); saveActive();
  }
  updateProgress();
  if (playing && Date.now() - lastSave > 10_000) saveActive();
}, 500);
