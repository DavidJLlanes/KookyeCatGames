const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const MAX_ENTRIES = 32;
let crcTable;

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let value = n;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[n] = value >>> 0;
  }
  return table;
}

function crc32(bytes) {
  crcTable ||= createCrcTable();
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

const write16 = (view, offset, value) => view.setUint16(offset, value, true);
const write32 = (view, offset, value) => view.setUint32(offset, value >>> 0, true);

export function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const localView = new DataView(local.buffer);
    write32(localView, 0, 0x04034b50); write16(localView, 4, 20); write16(localView, 6, 0); write16(localView, 8, 0);
    write16(localView, 10, 0); write16(localView, 12, 0); write32(localView, 14, crc); write32(localView, 18, data.length); write32(localView, 22, data.length);
    write16(localView, 26, name.length); write16(localView, 28, 0); local.set(name, 30); local.set(data, 30 + name.length);
    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    write32(centralView, 0, 0x02014b50); write16(centralView, 4, 20); write16(centralView, 6, 20); write16(centralView, 8, 0); write16(centralView, 10, 0);
    write16(centralView, 12, 0); write16(centralView, 14, 0); write32(centralView, 16, crc); write32(centralView, 20, data.length); write32(centralView, 24, data.length);
    write16(centralView, 28, name.length); write16(centralView, 30, 0); write16(centralView, 32, 0); write16(centralView, 34, 0); write16(centralView, 36, 0); write32(centralView, 38, 0); write32(centralView, 42, offset);
    central.set(name, 46); localParts.push(local); centralParts.push(central); offset += local.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22); const endView = new DataView(end.buffer);
  write32(endView, 0, 0x06054b50); write16(endView, 4, 0); write16(endView, 6, 0); write16(endView, 8, entries.length); write16(endView, 10, entries.length);
  write32(endView, 12, centralSize); write32(endView, 16, offset); write16(endView, 20, 0);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
}

async function inflateRaw(bytes, maxOutput) {
  if (!('DecompressionStream' in globalThis)) throw new Error('Este navegador no puede abrir ZIP comprimidos. Prueba un backup creado desde esta arcade.');
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxOutput) {
        await reader.cancel();
        throw new Error('El contenido descomprimido del backup supera el límite permitido.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
  return output;
}

function findEndRecord(view) {
  const start = Math.max(0, view.byteLength - 65_557);
  for (let offset = view.byteLength - 22; offset >= start; offset--) {
    if (view.getUint32(offset, true) !== 0x06054b50) continue;
    const commentLength = view.getUint16(offset + 20, true);
    if (offset + 22 + commentLength === view.byteLength) return offset;
  }
  throw new Error('El archivo no parece un ZIP válido.');
}

export async function readZip(file) {
  if (!file || file.size < 22 || file.size > MAX_BACKUP_BYTES) throw new Error('El backup debe ser un ZIP válido de menos de 10 MB.');
  let bytes;
  try { bytes = new Uint8Array(await file.arrayBuffer()); }
  catch { throw new Error('No se pudo leer el archivo de backup.'); }
  const view = new DataView(bytes.buffer);
  const end = findEndRecord(view);
  if (view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0) throw new Error('No se admiten archivos ZIP divididos en varias partes.');
  const count = view.getUint16(end + 10, true);
  const centralSize = view.getUint32(end + 12, true);
  const centralOffset = view.getUint32(end + 16, true);
  if (count === 0 || count > MAX_ENTRIES || centralOffset + centralSize > end) throw new Error('La estructura del backup no es válida.');

  const files = new Map();
  let cursor = centralOffset;
  let totalUncompressed = 0;
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > centralOffset + centralSize || view.getUint32(cursor, true) !== 0x02014b50) throw new Error('La estructura del backup no es válida.');
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const expectedCrc = view.getUint32(cursor + 16, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const recordLength = 46 + nameLength + extraLength + commentLength;
    if (cursor + recordLength > centralOffset + centralSize) throw new Error('La estructura del backup no es válida.');
    let name;
    try { name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength)); }
    catch { throw new Error('El backup contiene un nombre de archivo no válido.'); }
    cursor += recordLength;
    if (!name || name.endsWith('/')) continue;
    const parts = name.replaceAll(String.fromCharCode(92), '/').split('/');
    if (name.startsWith('/') || name.includes(':') || parts.includes('..') || /[\u0000-\u001f]/.test(name)) throw new Error('El backup contiene una ruta no permitida.');
    if (files.has(name)) throw new Error('El backup contiene archivos duplicados.');
    if ((flags & 1) !== 0 || ![0, 8].includes(method)) throw new Error('El ZIP usa una protección o compresión no compatible.');
    if (size > MAX_BACKUP_BYTES || compressedSize > MAX_BACKUP_BYTES || localOffset + 30 > centralOffset) throw new Error('El contenido del backup no es válido.');
    totalUncompressed += size;
    if (totalUncompressed > MAX_BACKUP_BYTES) throw new Error('El contenido total del backup supera el límite permitido.');
    if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('El contenido del backup no es válido.');
    const localFlags = view.getUint16(localOffset + 6, true);
    const localMethod = view.getUint16(localOffset + 8, true);
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    let localName;
    try { localName = decoder.decode(bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength)); }
    catch { throw new Error('El nombre de un archivo del backup no es válido.'); }
    if ((localFlags & 1) !== 0 || localMethod !== method || localName !== name || dataEnd > centralOffset || dataEnd > bytes.length) {
      throw new Error('La estructura de un archivo del backup no es válida.');
    }
    const compressed = bytes.subarray(dataStart, dataEnd);
    const content = method === 0 ? compressed.slice() : await inflateRaw(compressed, size);
    if (content.length !== size || crc32(content) !== expectedCrc) throw new Error('Un archivo del backup está dañado.');
    try { files.set(name, decoder.decode(content)); }
    catch { throw new Error('Un archivo del backup contiene texto no válido.'); }
  }
  if (cursor !== centralOffset + centralSize) throw new Error('La estructura del backup no es válida.');
  return files;
}

export function downloadZip(blob, filename) {
  const url = URL.createObjectURL(blob); const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1200);
}
