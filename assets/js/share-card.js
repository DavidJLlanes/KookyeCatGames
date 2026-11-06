function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

export async function makeShareCard({ title, subtitle, score, trophies = [] }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext('2d');
  const background = context.createLinearGradient(0, 0, 1200, 630);
  background.addColorStop(0, '#171421');
  background.addColorStop(.58, '#29203b');
  background.addColorStop(1, '#482447');
  context.fillStyle = background;
  context.fillRect(0, 0, 1200, 630);
  context.globalAlpha = .25;
  for (let radius = 75; radius < 330; radius += 30) {
    context.beginPath();
    context.arc(1000, 140, radius, 0, Math.PI * 2);
    context.strokeStyle = radius % 2 ? '#ff73b8' : '#6ce7e8';
    context.lineWidth = 2;
    context.stroke();
  }
  context.globalAlpha = 1;
  roundedRect(context, 70, 65, 1060, 500, 30);
  context.fillStyle = '#11101acc';
  context.fill();
  context.strokeStyle = '#ffffff24';
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = '#cefa8c';
  context.font = '800 19px system-ui';
  context.fillText(subtitle.toUpperCase(), 120, 140);
  context.fillStyle = '#fbf9ff';
  context.font = '800 66px system-ui';
  context.fillText(title.slice(0, 26), 120, 235);
  context.fillStyle = '#9c9aaa';
  context.font = '600 20px system-ui';
  context.fillText('PUNTUACIÓN', 122, 300);
  context.fillStyle = '#ff73b8';
  context.font = '800 76px system-ui';
  context.fillText(String(score), 120, 390);
  context.fillStyle = '#9c9aaa';
  context.font = '600 17px system-ui';
  context.fillText(trophies.length ? `TROFEOS · ${trophies.slice(0, 3).join(' · ')}` : 'TROFEOS · Próximo desbloqueo en camino', 122, 464);
  context.fillStyle = '#8f8b9a';
  context.font = '500 15px system-ui';
  context.fillText('Progreso local · KookyeCat Games', 120, 525);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

export async function shareOrSave(blob, filename) {
  if (!blob) throw new Error('No se pudo crear la tarjeta.');
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Kookye Cat Games' }); return 'shared'; }
    catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'saved';
}
