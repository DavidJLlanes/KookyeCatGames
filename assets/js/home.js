import { ACHIEVEMENTS, achievementIcon, getAchievementCounts, metricValue } from './achievements.js?v=20';
import { loadProfile, saveProfile } from './storage.js?v=20';
import { downloadZip } from './zip.js';
import { exportAllBackup, restoreBackup } from './backups.js?v=20';
import { makeShareCard, shareOrSave } from './share-card.js';

const $ = selector => document.querySelector(selector);

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('visible');
  clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function renderTrophies(profile) {
  const owned = new Set(profile.achievements);
  const scope = document.querySelector('[data-award-scope].selected')?.dataset.awardScope || 'all';
  const kind = document.querySelector('[data-award-kind].selected')?.dataset.awardKind || 'all';
  const visible = ACHIEVEMENTS.filter(item => (scope === 'all' || item.scope === scope) && (kind === 'all' || item.kind === kind));
  $('#trophy-list').innerHTML = visible.map(item => `
    <article class="trophy-card ${owned.has(item.id) ? 'earned' : ''} tier-${item.tier.toLowerCase()} ${item.kind}">
      <span class="medal"><img src="${achievementIcon(item)}" alt="" width="53" height="53" loading="lazy"></span><div class="award-content"><span class="award-type">${item.kind === 'trophy' ? 'TROFEO' : 'LOGRO'} · ${item.tier}</span><strong>${item.name}</strong>
      <small>${item.detail}</small><span class="award-progress">${owned.has(item.id) ? '✓ Desbloqueado' : `${Math.min(metricValue(profile, item.metric), item.target).toLocaleString('es-ES')} / ${item.target.toLocaleString('es-ES')}`}</span></div>
    </article>`).join('');
  const counts = getAchievementCounts(profile);
  $('#trophies-earned').textContent = counts.earned;
  $('#trophies-total').textContent = counts.total;
  $('#trophy-progress').textContent = `${Math.round(visible.filter(item => owned.has(item.id)).length / visible.length * 100)}%`;
  $('#award-summary').textContent = `${visible.filter(item => owned.has(item.id)).length} / ${visible.length} ${kind === 'trophy' ? 'trofeos' : kind === 'achievement' ? 'logros' : 'premios'} en esta selección`;
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
  $('#award-filters').addEventListener('click', event => {
    const button = event.target.closest('button[data-award-scope],button[data-award-kind]');
    if (!button) return;
    const attribute = button.hasAttribute('data-award-scope') ? 'data-award-scope' : 'data-award-kind';
    document.querySelectorAll(`[${attribute}]`).forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    renderTrophies(profile);
  });
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
    try { await importBackup(file); profile = await loadProfile(); } catch (error) { showToast(error.message || 'No se pudo abrir el backup.'); }
    event.target.value = '';
  });
  import('./pwa-update.js?v=20').then(({ enablePwaUpdates }) => enablePwaUpdates('./sw.js', showToast)).catch(() => {});
});
