import { createZip, readZip } from './zip.js';
import { ACHIEVEMENTS } from './achievements.js?v=30';
import { GAMES, GAME_BY_ID } from '../../core/game-registry.js?v=30';
import { loadAchievementCatalog } from './achievements.js?v=30';

const SIGNATURE = 'kookye-cat-games-backup';
const SCHEMA_VERSION = 2;

export function makeBackupManifest(scope, gameIds) {
  return JSON.stringify({
    format: SIGNATURE,
    version: SCHEMA_VERSION,
    scope,
    gameIds,
    createdAt: new Date().toISOString(),
  }, null, 2);
}

export async function exportGameBackup(gameId, progress, achievements = []) {
  const manifest = makeBackupManifest('game', [gameId]);
  const validAchievements = new Set(ACHIEVEMENTS.map(item => item.id));
  const payload = JSON.stringify({
    gameId,
    schemaVersion: SCHEMA_VERSION,
    progress,
    achievements: achievements.filter(id => validAchievements.has(id)),
  }, null, 2);
  return createZip([
    { name: 'backup-manifest.json', data: manifest },
    { name: `${gameId}/progress.json`, data: payload },
  ]);
}

export async function exportAllBackup(profile) {
  const gameIds = Object.keys(profile.games);
  const entries = [
    { name: 'backup-manifest.json', data: makeBackupManifest('all', gameIds) },
    { name: 'profile.json', data: JSON.stringify(profile, null, 2) },
    ...gameIds.map(id => ({
      name: `${id}/progress.json`,
      data: JSON.stringify({ gameId: id, schemaVersion: SCHEMA_VERSION, progress: profile.games[id] }, null, 2),
    })),
  ];
  return createZip(entries);
}

function parseJson(files, name, message) {
  const text = files.get(name);
  if (!text) throw new Error(message);
  try { return JSON.parse(text); }
  catch { throw new Error(message); }
}

function validateGameIds(gameIds, knownGames) {
  if (!Array.isArray(gameIds) || gameIds.length === 0 || new Set(gameIds).size !== gameIds.length) {
    throw new Error('El manifiesto del backup contiene una lista de juegos no válida.');
  }
  if (gameIds.some(id => typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id) || !knownGames.includes(id))) {
    throw new Error('El backup menciona un juego desconocido o no instalado.');
  }
}

function validateGameProgress(gameId, progress) {
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) return false;
  const expected = GAME_BY_ID.get(gameId)?.progress;
  const compatible = (value, template) => Object.entries(template).every(([key, sample]) => {
    const item = value[key];
    if (Array.isArray(sample)) return Array.isArray(item);
    if (sample === null) return item === null || typeof item === 'object' && !Array.isArray(item);
    if (typeof sample === 'object') return item && typeof item === 'object' && !Array.isArray(item) && compatible(item, sample);
    if (typeof sample === 'number') return key === 'arcadeXp' && item === undefined || Number.isFinite(item) && item >= 0;
    return typeof item === typeof sample;
  });
  return !!expected && compatible(progress, expected);
}

export async function restoreBackup(file, profile, saveProfile, knownGames = GAMES.map(game => game.id), expectedScope = null) {
  await loadAchievementCatalog(knownGames);
  const files = await readZip(file);
  const manifest = parseJson(files, 'backup-manifest.json', 'El manifiesto del backup no existe o está dañado.');
  if (manifest.format !== SIGNATURE || manifest.version !== SCHEMA_VERSION || !['game', 'all'].includes(manifest.scope)) {
    throw new Error('El archivo no es un backup compatible de Kookye Cat Games.');
  }
  if (expectedScope && manifest.scope !== expectedScope) {
    throw new Error(expectedScope === 'game'
      ? 'Desde Picross puedes restaurar un backup de Picross. Para restaurar todos los juegos, usa la portada.'
      : 'El backup no corresponde al tipo de restauración solicitado.');
  }
  validateGameIds(manifest.gameIds, knownGames);

  let next;
  if (manifest.scope === 'all') {
    next = parseJson(files, 'profile.json', 'El backup completo no contiene un perfil válido.');
    if (next?.schemaVersion !== SCHEMA_VERSION || !next.games || typeof next.games !== 'object' || Array.isArray(next.games) ||
        !next.stats || typeof next.stats !== 'object' || Array.isArray(next.stats)) {
      throw new Error('La versión o estructura del progreso no es compatible.');
    }
    for (const key of ['gamesPlayed', 'gamesSolved', 'playSeconds', 'totalPoints']) {
      if (!Number.isFinite(next.stats[key]) || next.stats[key] < 0) throw new Error('El backup contiene estadísticas no válidas.');
    }
    if (next.stats.arcadeXp !== undefined && (!Number.isFinite(next.stats.arcadeXp) || next.stats.arcadeXp < 0)) throw new Error('El backup contiene XP no válidos.');
    const profileGameIds = Object.keys(next.games);
    if (profileGameIds.length !== manifest.gameIds.length || profileGameIds.some(id => !manifest.gameIds.includes(id))) {
      throw new Error('El perfil del backup no coincide con la lista de juegos declarada.');
    }
    for (const id of manifest.gameIds) {
      const progressFile = parseJson(files, `${id}/progress.json`, `El backup está incompleto: falta el progreso de ${id}.`);
      if (progressFile.gameId !== id || progressFile.schemaVersion !== SCHEMA_VERSION || !validateGameProgress(id, progressFile.progress)) {
        throw new Error(`El progreso de ${id} no es compatible.`);
      }
    }
    const validAchievements = new Set(ACHIEVEMENTS.map(item => item.id));
    next.achievements = Array.isArray(next.achievements)
      ? [...new Set(next.achievements.filter(id => validAchievements.has(id)))]
      : [];
  } else {
    const id = manifest.gameIds[0];
    if (manifest.gameIds.length !== 1) throw new Error('El backup de juego debe contener un solo juego.');
    const payload = parseJson(files, `${id}/progress.json`, 'No se encuentra el progreso del juego o está dañado.');
    if (payload.gameId !== id || payload.schemaVersion !== SCHEMA_VERSION || !validateGameProgress(id, payload.progress)) {
      throw new Error('El progreso del juego no es compatible.');
    }
    const previous = profile.games[id] || {};
    const updated = payload.progress;
    const aggregate = { ...profile.stats };
    for (const [aggregateKey, gameKey] of [
      ['gamesPlayed', 'gamesPlayed'],
      ['gamesSolved', 'solved'],
      ['playSeconds', 'playedSeconds'],
      ['totalPoints', 'totalPoints'],
      ['arcadeXp', 'arcadeXp'],
    ]) {
      aggregate[aggregateKey] = Math.max(0,
        (Number(profile.stats[aggregateKey]) || 0) - (Number(previous[gameKey]) || 0) + (Number(updated[gameKey]) || 0));
    }
    next = {
      ...profile,
      stats: aggregate,
      games: { ...profile.games, [id]: updated },
    };
    const validAchievements = new Set(ACHIEVEMENTS.map(item => item.id));
    const gameAchievements = new Set(ACHIEVEMENTS.filter(item => item.scope === id).map(item => item.id));
    const importedAchievements = Array.isArray(payload.achievements)
      ? payload.achievements.filter(value => validAchievements.has(value) && gameAchievements.has(value))
      : [];
    next.achievements = [...new Set([
      ...profile.achievements.filter(value => !gameAchievements.has(value)),
      ...importedAchievements,
    ])];
  }

  await saveProfile(next);
  return manifest.scope;
}
