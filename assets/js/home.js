import { ACHIEVEMENTS, getAchievementCounts } from './achievements.js';
import { loadProfile, saveProfile } from './storage.js';
import { downloadZip } from './zip.js';
import { exportAllBackup, restoreBackup } from './backups.js';
import { makeShareCard, shareOrSave } from './share-card.js';

const $ = selector => document.querySelector(selector);

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('visible');
  clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function renderTrophies(profile) {
  const owned = new Set(profile.achievements);
  $('#trophy-list').innerHTML = ACHIEVEMENTS.map(item => `
    <article class="trophy-card ${owned.has(item.id) ? 'earned' : ''}">
      <span class="medal"><img src="./assets/art/trophy.svg" alt="" width="49" height="49" loading="lazy"></span><div><strong>${item.name}</strong>
      <small>${owned.has(item.id) ? `${item.tier} · Desbloqueado` : item.detail}</small></div>
    </article>`).join('');
  const counts = getAchievementCounts(profile);
  $('#trophies-earned').textContent = counts.earned;
  $('#trophies-total').textContent = counts.total;
  $('#trophy-progress').textContent = `${Math.round(counts.earned / counts.total * 100)}%`;
}

function renderProfile(profile) {
  $('#games-played').textContent = profile.stats.gamesPlayed;
  $('#play-time').textContent = profile.stats.playSeconds < 60 ? `${profile.stats.playSeconds} s` : `${Math.floor(profile.stats.playSeconds / 60)} min`;
  $('#picross-progress').textContent = `${profile.games.picross.completedLevels.length} / 60 niveles · ${profile.games.picross.solved} resueltos`;
  $('#personal-score').textContent = `${profile.stats.totalPoints.toLocaleString('es-ES')} pts`;
  renderTrophies(profile);
}

async function exportAll() {
  const profile = await loadProfile();
  downloadZip(await exportAllBackup(profile), 'games.zip');
  showToast('Copia de seguridad guardada en tu dispositivo.');
}

async function importBackup(file) {
  if (!window.confirm('El progreso de los juegos incluidos en el backup se restaurará en este dispositivo. ¿Continuar?')) return;
  const profile = await loadProfile();
  await restoreBackup(file, profile, saveProfile, ['picross']);
  renderProfile(await loadProfile());
  showToast('Backup restaurado en este dispositivo.');
}
document.addEventListener('DOMContentLoaded', async () => {
  let profile = await loadProfile();
  renderProfile(profile);
  $('#share-profile').addEventListener('click', async () => {
    profile = await loadProfile();
    const trophies = ACHIEVEMENTS.filter(item => profile.achievements.includes(item.id)).slice(-3).map(item => item.name);
    const image = await makeShareCard({ title: 'Mi arcade', subtitle: 'KOOKYE CAT GAMES', score: profile.stats.totalPoints.toLocaleString('es-ES'), trophies });
    if (await shareOrSave(image, 'kookye-cat-games.png') === 'saved') showToast('Tarjeta guardada como imagen.');
  });
  $('#backup-all').addEventListener('click', exportAll);
  $('#import-all').addEventListener('click', () => $('#backup-file').click());
  $('#backup-file').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { await importBackup(file); } catch (error) { showToast(error.message || 'No se pudo abrir el backup.'); }
    event.target.value = '';
  });
  import('./pwa-update.js?v=14').then(({ enablePwaUpdates }) => enablePwaUpdates('./sw.js', showToast)).catch(() => {});
});
