/** Lightweight game metadata. Add an entry; game code and awards load only when needed. */
export const GAMES = Object.freeze([
  {
    id: 'picross', name: 'Picross', path: './games/picross/', art: './assets/art/picross.svg',
    category: 'Puzle · Lógica', description: 'Descubre dibujos ocultos siguiendo las pistas. ¡Cada casilla cuenta!',
    awardCount: 41, levels: 60,
    modes: ['classic', 'timed', 'daily'],
    catalog: '../games/picross/achievements.js?v=49',
    progress: {
      gamesPlayed: 0, solved: 0, playedSeconds: 0, totalPoints: 0, arcadeXp: 0,
      bestScore: 0, bestTime: null, completedPuzzles: [], completedLevels: [],
      unlockedLevel: 1, active: null,
      metrics: { perfect: 0, lastHeart: 0, noHints: 0, pure: 0, dailyWins: 0,
        timedWins: 0, largeWins: 0, fastWins: 0, filledCells: 0, emptyCells: 0 },
    },
  },
  {
    id: 'fusion-2048', name: 'Fusión 2048', path: './games/2048/', art: './assets/art/fusion-2048.svg',
    category: 'Números · Estrategia', description: 'Desliza y fusiona números en 60 niveles, contrarreloj y reto diario.',
    awardCount: 35, levels: 60, modes: ['classic', 'timed', 'daily'],
    catalog: '../games/2048/achievements.js?v=49',
    progress: {
      gamesPlayed: 0, solved: 0, playedSeconds: 0, totalPoints: 0, arcadeXp: 0,
      bestScore: 0, bestTime: null, completedPuzzles: [], completedLevels: [], unlockedLevel: 1, active: null,
      metrics: { totalMoves: 0, totalMerges: 0, noUndo: 0, dailyWins: 0, timedWins: 0,
        efficientWins: 0, tile256: 0, tile1024: 0, tile2048: 0, campaignWins: 0 },
    },
  },
  {
    id: 'tetris', name: 'Tetris', path: './games/tetris/', art: './games/tetris/assets/cover.svg',
    category: 'Arcade · Reflejos', description: 'Gira piezas, completa filas y domina 60 niveles a velocidad creciente.',
    awardCount: 35, levels: 60, modes: ['classic', 'timed', 'daily'],
    catalog: '../games/tetris/achievements.js?v=49',
    progress: {
      gamesPlayed: 0, solved: 0, playedSeconds: 0, totalPoints: 0, arcadeXp: 0,
      bestScore: 0, bestTime: null, completedPuzzles: [], completedLevels: [], unlockedLevel: 1, active: null,
      metrics: { pieces: 0, lines: 0, tetrises: 0, maxLevel: 1, maxCombo: 0, dailyWins: 0,
        timedWins: 0, fastWins: 0 },
    },
  },
  {
    id: 'bubbleshooter', name: 'Bubble Shooter', path: './games/bubbleshooter/', art: './games/bubbleshooter/assets/cover.svg',
    category: 'Puntería · Estrategia', description: 'Apunta, rebota y despeja el cielo en 60 niveles llenos de color.',
    awardCount: 35, levels: 60, modes: ['classic', 'timed', 'daily'],
    catalog: '../games/bubbleshooter/achievements.js?v=49',
    progress: {
      gamesPlayed: 0, solved: 0, playedSeconds: 0, totalPoints: 0, arcadeXp: 0,
      bestScore: 0, bestTime: null, completedPuzzles: [], completedLevels: [], unlockedLevel: 1, active: null,
      metrics: { shots: 0, popped: 0, fallen: 0, bankShots: 0, bestCombo: 0, bigDrop: 0,
        dailyWins: 0, timedWins: 0, steadyWins: 0, fastWins: 0, preciseWins: 0 },
    },
  },
]);
export const GAME_BY_ID = new Map(GAMES.map(game => [game.id, game]));
if (GAME_BY_ID.size !== GAMES.length) throw new Error('Identificadores de juego duplicados.');
export const newGameProgress = game => structuredClone(game.progress);
