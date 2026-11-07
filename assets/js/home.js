import { ACHIEVEMENTS, achievementIcon, getAchievementCounts, metricValue, loadAchievementCatalog, unlockAchievements, unloadedGames } from './achievements.js?v=50';
import { GAMES } from '../../core/game-registry.js?v=50';
import { recordArcadeAction } from '../../core/events.js?v=50';
import { loadProfile, saveProfile } from './storage.js?v=50';
import { downloadZip } from './zip.js';
import { exportAllBackup, restoreBackup } from './backups.js?v=50';
import { shareProgressCard, labelShareButtons } from './share-card.js';

const $ = selector => document.querySelector(selector);

// Capture Chrome's install event as soon as this module loads. The page performs
// asynchronous profile and achievement work before DOMContentLoaded finishes.
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstall = event;
});

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('visible');
  clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function setupInstallControls() {
  const installButton = $('#install-app');
  const installDialog = $('#install-dialog');
  const installSteps = $('#install-steps');
  if (!installButton || !installDialog || !installSteps) return;

  installButton.addEventListener('click', async () => {
    if (deferredInstall) {
      const installEvent = deferredInstall;
      deferredInstall = null;
      try {
        await installEvent.prompt();
        await installEvent.userChoice;
      } catch {
        showToast('No se pudo abrir la instalación. Prueba desde el menú del navegador.');
      }
      return;
    }

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    const macSafari = /Macintosh/.test(ua) && safari;
    if (ios) {
      installSteps.innerHTML = '<p>En iPhone o iPad, abre el menú <strong>Compartir</strong> y elige <strong>Añadir a pantalla de inicio</strong>. Si no aparece, busca la opción en <strong>Editar acciones</strong>.</p>';
    } else if (macSafari) {
      installSteps.innerHTML = '<p>En Safari para Mac, abre <strong>Archivo → Añadir al Dock</strong> para guardar la arcade como app.</p>';
    } else {
      installSteps.innerHTML = '<p>Abre el menú del navegador y selecciona <strong>Instalar aplicación</strong>. En Chrome también puedes usar el icono de instalación que aparece en la barra de direcciones.</p>';
    }
    if (installDialog.showModal) installDialog.showModal();
    else installDialog.setAttribute('open', '');
  });

  $('#install-dismiss')?.addEventListener('click', () => installDialog.close?.());
  const alreadyInstalled = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  if (alreadyInstalled) { installButton.textContent = 'Aplicación instalada'; installButton.disabled = true; }
  window.addEventListener('appinstalled', () => { installButton.textContent = 'Aplicación instalada'; installButton.disabled = true; });
}

setupInstallControls();

function renderTrophies(profile) {
  const owned = new Set(profile.achievements);
  const scope = document.querySelector('[data-award-scope].selected')?.dataset.awardScope || 'all';
  const kind = document.querySelector('[data-award-kind].selected')?.dataset.awardKind || 'all';
  const search = $('#award-search').value.trim().toLocaleLowerCase('es');
  const visible = ACHIEVEMENTS.filter(item => (scope === 'all' || item.scope === scope) && (kind === 'all' || item.kind === kind) &&
    (!search || `${item.name} ${item.detail}`.toLocaleLowerCase('es').includes(search)));
  const pageSize = Number($('#trophy-list').dataset.limit || 24);
  $('#trophy-list').innerHTML = visible.slice(0, pageSize).map(item => `
    <article class="trophy-card ${owned.has(item.id) ? 'earned' : ''} tier-${item.tier.toLowerCase()} ${item.kind}">
      <span class="medal"><img src="${achievementIcon(item)}" alt="" width="53" height="53" loading="lazy"></span><div class="award-content"><span class="award-type">${item.kind === 'trophy' ? 'TROFEO' : 'LOGRO'} · ${item.tier}</span><strong>${item.name}</strong>
      <small>${item.detail}</small><span class="award-progress">${owned.has(item.id) ? '✓ Desbloqueado' : `${Math.min(metricValue(profile, item.metric), item.target).toLocaleString('es-ES')} / ${item.target.toLocaleString('es-ES')}`}</span></div>
    </article>`).join('');
  const counts = getAchievementCounts(profile);
  $('#trophies-earned').textContent = counts.earned;
  $('#trophies-total').textContent = counts.total;
  $('#trophy-progress').textContent = `${visible.filter(item => owned.has(item.id)).length} / ${visible.length}`;
  $('#award-summary').textContent = `${visible.filter(item => owned.has(item.id)).length} / ${visible.length} ${kind === 'trophy' ? 'trofeos' : kind === 'achievement' ? 'logros' : 'premios'} en esta selección`;
  $('#more-awards').hidden = visible.length <= pageSize && (scope !== 'all' || !unloadedGames().length);
}

function renderProfile(profile) {
  $('#games-played').textContent = profile.stats.gamesPlayed;
  $('#play-time').textContent = profile.stats.playSeconds < 60 ? `${profile.stats.playSeconds} s` : `${Math.floor(profile.stats.playSeconds / 60)} min`;
  $('#game-list').querySelectorAll('[data-game-progress]').forEach(label => {
    const progress = profile.games[label.dataset.gameProgress];
    label.textContent = `${progress?.solved || 0} resueltos · ${progress?.gamesPlayed || 0} partidas`;
  });
  $('#personal-score').textContent = `${profile.stats.arcadeXp.toLocaleString('es-ES')} XP`;
  renderTrophies(profile);
}

async function exportAll() {
  const profile = await loadProfile();
  recordArcadeAction(profile, 'export'); unlockAchievements(profile); await saveProfile(profile);
  downloadZip(await exportAllBackup(profile), 'games.zip');
  renderProfile(profile);
  showToast('Copia de seguridad guardada en tu dispositivo.');
  return profile;
}

async function importBackup(file) {
  if (!window.confirm('El progreso de los juegos incluidos en el backup se restaurará en este dispositivo. ¿Continuar?')) return;
  const profile = await loadProfile();
  await restoreBackup(file, profile, saveProfile, GAMES.map(game => game.id));
  const restored = await loadProfile();
  recordArcadeAction(restored, 'import'); unlockAchievements(restored); await saveProfile(restored);
  renderProfile(restored);
  showToast('Backup restaurado en este dispositivo.');
  return restored;
}
document.addEventListener('DOMContentLoaded', async () => {
  let profile = await loadProfile();
  if (GAMES[0]) await loadAchievementCatalog([GAMES[0].id]);
  $('#game-list').insertAdjacentHTML('afterbegin', GAMES.map(game => `<a class="game-card" href="${game.path}"><div class="game-art"><img src="${game.art}" alt="" width="800" height="480" loading="lazy"><span class="art-tag">¡JUEGA YA!</span></div><div class="game-info"><span class="tag">🧩 ${game.category.toLocaleUpperCase('es')}</span><h3>${game.name}</h3><p>${game.description}</p><div class="card-bottom"><span data-game-progress="${game.id}">Aún sin partidas</span><b aria-hidden="true">→</b></div></div></a>`).join(''));
  try {
    const today = new Date().toLocaleDateString('en-CA');
    if (!sessionStorage.getItem('kcg:arcade:visit') || !profile.arcade.visitDays.includes(today)) {
      sessionStorage.setItem('kcg:arcade:visit', '1');
      recordArcadeAction(profile, 'visit', today); unlockAchievements(profile); await saveProfile(profile);
    }
  } catch { /* Private mode may disable session storage. */ }
  const scopeGroup = document.querySelector('[data-award-scope="all"]')?.parentElement;
  for (const game of GAMES) {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.awardScope = game.id; button.textContent = game.name; button.setAttribute('aria-pressed', 'false');
    scopeGroup?.append(button);
  }
  $('#award-filters').addEventListener('click', async event => {
    const button = event.target.closest('button[data-award-scope],button[data-award-kind]');
    if (!button) return;
    const attribute = button.hasAttribute('data-award-scope') ? 'data-award-scope' : 'data-award-kind';
    document.querySelectorAll(`[${attribute}]`).forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    $('#trophy-list').dataset.limit = '24';
    if (button.dataset.awardScope && button.dataset.awardScope !== 'all' && button.dataset.awardScope !== 'arcade') await loadAchievementCatalog([button.dataset.awardScope]);
    renderTrophies(profile);
  });
  $('#award-search').addEventListener('input', async () => {
    $('#trophy-list').dataset.limit = '24';
    if ($('#award-search').value.trim() && document.querySelector('[data-award-scope].selected')?.dataset.awardScope === 'all') await loadAchievementCatalog();
    renderTrophies(profile);
  });
  $('#more-awards').addEventListener('click', async () => {
    const nextLimit = Number($('#trophy-list').dataset.limit || 24) + 24;
    $('#trophy-list').dataset.limit = String(nextLimit);
    const scope = document.querySelector('[data-award-scope].selected')?.dataset.awardScope;
    const kind = document.querySelector('[data-award-kind].selected')?.dataset.awardKind;
    const search = $('#award-search').value.trim().toLocaleLowerCase('es');
    const matching = () => ACHIEVEMENTS.filter(item => (scope === 'all' || item.scope === scope) &&
      (kind === 'all' || item.kind === kind) && (!search || `${item.name} ${item.detail}`.toLocaleLowerCase('es').includes(search))).length;
    while (scope === 'all' && matching() < nextLimit && unloadedGames().length) await loadAchievementCatalog([unloadedGames()[0].id]);
    renderTrophies(profile);
  });
  renderProfile(profile);
  $('#share-profile').addEventListener('click', async () => {
    profile = await loadProfile();
    await loadAchievementCatalog();
    const result = await shareProgressCard({ profile, scope: 'arcade', title: 'Mi arcade' }, 'kookye-cat-games.png', $('#share-profile'));
    if (result === 'ready') { showToast('Tarjeta lista. Toca otra vez para abrir Compartir.'); return; }
    if (result !== 'cancelled') {
      recordArcadeAction(profile, 'share'); unlockAchievements(profile); await saveProfile(profile); renderProfile(profile);
      if (result === 'saved') showToast('Tarjeta guardada como imagen.');
    }
  });
  labelShareButtons($('#share-profile'), $('#share-profile-header'));
  $('#share-profile-header').addEventListener('click', () => $('#share-profile').click());
  $('#backup-all').addEventListener('click', async () => { profile = await exportAll(); });
  $('#import-all').addEventListener('click', () => $('#backup-file').click());
  $('#backup-file').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { profile = await importBackup(file) || profile; } catch (error) { showToast(error.message || 'No se pudo abrir el backup.'); }
    event.target.value = '';
  });
  import('./pwa-update.js?v=50').then(({ enablePwaUpdates }) => enablePwaUpdates('./sw.js', showToast)).catch(() => {});
});
