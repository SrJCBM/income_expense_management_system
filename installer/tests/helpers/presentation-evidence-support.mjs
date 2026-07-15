import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PNG_SIGNATURE = '89504e470d0a1a0a';

export function isPng(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
  const descriptor = fs.openSync(filePath, 'r');
  try {
    const signature = Buffer.alloc(8);
    const bytesRead = fs.readSync(descriptor, signature, 0, signature.length, 0);
    return bytesRead === 8 && signature.toString('hex') === PNG_SIGNATURE;
  } finally {
    fs.closeSync(descriptor);
  }
}

function statusCount(text, label) {
  const match = text.match(new RegExp(`^${label}:\\s*(\\d+)\\s*$`, 'im'))
    ?? text.match(new RegExp(`^#\\s*${label}\\s+(\\d+)\\s*$`, 'im'));
  return match ? Number.parseInt(match[1], 10) : 0;
}

export function readLogSummary(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, pass: 0, fail: 0, skipped: 0, pendingManual: 0, text: '' };
  }
  const text = fs.readFileSync(filePath, 'utf8');
  return {
    exists: true,
    pass: statusCount(text, 'PASS'),
    fail: statusCount(text, 'FAIL'),
    skipped: statusCount(text, 'SKIPPED'),
    pendingManual: statusCount(text, 'PENDING_MANUAL'),
    text,
  };
}

export async function getArtifactMetadata(filePath) {
  if (!fs.existsSync(filePath)) return { exists: false, name: path.basename(filePath) };
  const [buffer, stat] = await Promise.all([
    fs.promises.readFile(filePath),
    fs.promises.stat(filePath),
  ]);
  return {
    exists: true,
    name: path.basename(filePath),
    sizeBytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
    sha256: createHash('sha256').update(buffer).digest('hex'),
  };
}

function resolveInsideRoot(projectRoot, relativePath) {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return resolved;
}

export async function loadIntegrationManifest(manifestPath, projectRoot) {
  if (!fs.existsSync(manifestPath)) {
    return { ready: false, reason: 'No existe una declaración local de integración real.' };
  }

  let manifest;
  try {
    manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
  } catch {
    return { ready: false, reason: 'La declaración de integración real no contiene JSON válido.' };
  }

  if (manifest.confirmedSharedRecord !== true) {
    return { ready: false, reason: 'La integración real no está confirmada.' };
  }
  if (typeof manifest.recordLabel !== 'string' || !manifest.recordLabel.trim()) {
    return { ready: false, reason: 'La declaración no identifica el registro compartido.' };
  }

  const imageKeys = ['web', 'android', 'electron'];
  const images = {};
  for (const key of imageKeys) {
    const relativePath = manifest.images?.[key];
    if (typeof relativePath !== 'string') {
      return { ready: false, reason: `Falta la imagen real de ${key}.` };
    }
    const resolved = resolveInsideRoot(projectRoot, relativePath);
    if (!resolved) return { ready: false, reason: `La imagen de ${key} está fuera del proyecto.` };
    if (!isPng(resolved)) return { ready: false, reason: `La imagen de ${key} no es un PNG válido.` };
    images[key] = resolved;
  }

  return {
    ready: true,
    reason: '',
    recordLabel: manifest.recordLabel.trim(),
    images,
  };
}
