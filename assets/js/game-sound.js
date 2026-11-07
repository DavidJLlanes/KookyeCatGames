// Small synthesized effects: no downloads, audio files, or background music.
export function createGameSound(gameId, selector = '#sound-toggle') {
  const key = `kookye-cat-games:sound:${gameId}`;
  const button = document.querySelector(selector);
  let enabled = localStorage.getItem(key) !== 'off';
  let context;
  let lastPlayed = 0;
  function update() {
    button?.setAttribute('aria-pressed', String(enabled));
    button?.setAttribute('aria-label', enabled ? 'Desactivar sonidos del juego' : 'Activar sonidos del juego');
    if (button) button.textContent = enabled ? 'Sonido: sí' : 'Sonido: no';
  }
  button?.addEventListener('click', () => {
    enabled = !enabled;
    localStorage.setItem(key, enabled ? 'on' : 'off');
    update();
    if (enabled) play('tap');
  });
  function play(kind = 'tap') {
    if (!enabled || document.hidden) return;
    if ((kind === 'tap' || kind === 'merge') && performance.now() - lastPlayed < 65) return;
    lastPlayed = performance.now();
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      context ??= new AudioContext();
      if (context.state === 'suspended') void context.resume();
      const now = context.currentTime;
      const notes = kind === 'win' ? [523, 659, 784] : kind === 'error' ? [220] : kind === 'merge' ? [440, 554] : [420];
      notes.forEach((note, index) => {
        const start = now + index * 0.085;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(kind === 'error' ? 0.025 : 0.035, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.14);
      });
    } catch { /* Audio is optional if the browser disallows playback. */ }
  }
  update();
  return play;
}
