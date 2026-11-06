export const ACHIEVEMENTS = [
  { id: 'first-game', scope: 'arcade', name: 'Primera partida', detail: 'Juega tu primera partida.', icon: '▶', tier: 'BRONCE', test: p => p.stats.gamesPlayed >= 1 },
  { id: 'five-games', scope: 'arcade', name: 'Ya estás dentro', detail: 'Juega 5 partidas.', icon: '✦', tier: 'BRONCE', test: p => p.stats.gamesPlayed >= 5 },
  { id: 'twenty-five-games', scope: 'arcade', name: 'De la casa', detail: 'Juega 25 partidas.', icon: '⌂', tier: 'PLATA', test: p => p.stats.gamesPlayed >= 25 },
  { id: 'hundred-games', scope: 'arcade', name: 'Una más y paro', detail: 'Juega 100 partidas.', icon: '∞', tier: 'ORO', test: p => p.stats.gamesPlayed >= 100 },
  { id: 'picross-first', scope: 'picross', name: 'Mente brillante', detail: 'Resuelve tu primer Picross.', icon: '▦', tier: 'BRONCE', test: p => p.games.picross.solved >= 1 },
  { id: 'picross-five', scope: 'picross', name: 'Pieza a pieza', detail: 'Resuelve 5 Picross.', icon: '▧', tier: 'PLATA', test: p => p.games.picross.solved >= 5 },
  { id: 'picross-twenty', scope: 'picross', name: 'Lógica imparable', detail: 'Resuelve 20 Picross.', icon: '◈', tier: 'ORO', test: p => p.games.picross.solved >= 20 },
  { id: 'daily-first', scope: 'picross', name: 'Hoy toca reto', detail: 'Completa un reto diario.', icon: '☼', tier: 'BRONCE', test: p => p.games.picross.completedPuzzles.some(id => id.startsWith('daily:')) },
  { id: 'daily-seven', scope: 'picross', name: 'Semana redonda', detail: 'Completa 7 retos diarios.', icon: '▦', tier: 'PLATA', test: p => p.games.picross.completedPuzzles.filter(id => id.startsWith('daily:')).length >= 7 },
  { id: 'picross-speed', scope: 'picross', name: 'Veloz y certero', detail: 'Resuelve un puzle en menos de 60 segundos.', icon: 'ϟ', tier: 'ORO', test: p => p.games.picross.bestTime !== null && p.games.picross.bestTime < 60 },
  { id: 'picross-points-500', scope: 'picross', name: 'Buen comienzo', detail: 'Consigue 500 puntos acumulados.', icon: '★', tier: 'BRONCE', test: p => p.games.picross.totalPoints >= 500 },
  { id: 'picross-points-5000', scope: 'picross', name: 'Máquina de puntos', detail: 'Consigue 5.000 puntos acumulados.', icon: '✧', tier: 'ORO', test: p => p.games.picross.totalPoints >= 5000 },
  { id: 'picross-level-one', scope: 'picross', name: 'Primer peldaño', detail: 'Completa un nivel de la campaña.', icon: '?', tier: 'BRONCE', test: p => p.games.picross.completedLevels?.length >= 1 },
  { id: 'picross-level-ten', scope: 'picross', name: 'En racha', detail: 'Completa 10 niveles de la campaña.', icon: '?', tier: 'PLATA', test: p => p.games.picross.completedLevels?.length >= 10 },
  { id: 'picross-level-thirty', scope: 'picross', name: 'Gran estratega', detail: 'Completa 30 niveles de la campaña.', icon: '?', tier: 'ORO', test: p => p.games.picross.completedLevels?.length >= 30 },
  { id: 'picross-campaign-complete', scope: 'picross', name: 'Maestro del Picross', detail: 'Completa los 60 niveles de la campaña.', icon: '?', tier: 'ORO', test: p => p.games.picross.completedLevels?.length >= 60 },
];

export function unlockAchievements(profile) {
  const owned = new Set(profile.achievements);
  const newlyUnlocked = ACHIEVEMENTS.filter(item => !owned.has(item.id) && item.test(profile));
  profile.achievements = [...owned, ...newlyUnlocked.map(item => item.id)];
  return newlyUnlocked;
}

export function getAchievementCounts(profile) {
  return {
    earned: ACHIEVEMENTS.filter(item => profile.achievements.includes(item.id)).length,
    total: ACHIEVEMENTS.length,
  };
}
