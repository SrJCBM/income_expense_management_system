import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  getArtifactMetadata,
  isPng,
  loadIntegrationManifest,
  readLogSummary,
} from './helpers/presentation-evidence-support.mjs';

const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'financeapp-evidence-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function writePng(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.concat([PNG_SIGNATURE, Buffer.from('test-image')]));
}

test('isPng acepta la firma PNG y rechaza archivos de texto', (t) => {
  const directory = temporaryDirectory(t);
  const pngPath = path.join(directory, 'evidence.png');
  const textPath = path.join(directory, 'not-image.png');
  writePng(pngPath);
  fs.writeFileSync(textPath, 'not a png');

  assert.equal(isPng(pngPath), true);
  assert.equal(isPng(textPath), false);
  assert.equal(isPng(path.join(directory, 'missing.png')), false);
});

test('readLogSummary cuenta estados y conserva el texto real', (t) => {
  const directory = temporaryDirectory(t);
  const logPath = path.join(directory, 'qa.txt');
  fs.writeFileSync(logPath, [
    '[PASS] web: build',
    'PASS: 20',
    'FAIL: 1',
    'SKIPPED: 3',
    'PENDING_MANUAL: 2',
  ].join('\n'));

  assert.deepEqual(readLogSummary(logPath), {
    exists: true,
    pass: 20,
    fail: 1,
    skipped: 3,
    pendingManual: 2,
    text: fs.readFileSync(logPath, 'utf8'),
  });
  assert.deepEqual(readLogSummary(path.join(directory, 'missing.txt')), {
    exists: false,
    pass: 0,
    fail: 0,
    skipped: 0,
    pendingManual: 0,
    text: '',
  });
});

test('readLogSummary reconoce el resumen TAP de node test', (t) => {
  const directory = temporaryDirectory(t);
  const logPath = path.join(directory, 'tap.txt');
  fs.writeFileSync(logPath, '# tests 20\n# pass 20\n# fail 0\n# skipped 0\n');

  const summary = readLogSummary(logPath);
  assert.equal(summary.pass, 20);
  assert.equal(summary.fail, 0);
  assert.equal(summary.skipped, 0);
});

test('getArtifactMetadata calcula tamaño, fecha y SHA-256 reales', async (t) => {
  const directory = temporaryDirectory(t);
  const artifactPath = path.join(directory, 'FinanceApp.exe');
  const bytes = Buffer.from('financeapp-artifact');
  fs.writeFileSync(artifactPath, bytes);

  const metadata = await getArtifactMetadata(artifactPath);
  assert.equal(metadata.exists, true);
  assert.equal(metadata.name, 'FinanceApp.exe');
  assert.equal(metadata.sizeBytes, bytes.length);
  assert.match(metadata.modifiedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(metadata.sha256, createHash('sha256').update(bytes).digest('hex'));

  assert.deepEqual(await getArtifactMetadata(path.join(directory, 'missing.apk')), {
    exists: false,
    name: 'missing.apk',
  });
});

test('loadIntegrationManifest exige confirmación y tres PNG dentro del proyecto', async (t) => {
  const root = temporaryDirectory(t);
  const images = {
    web: 'evidencias/web.png',
    android: 'evidencias/android.png',
    electron: 'evidencias/electron.png',
  };
  for (const relativePath of Object.values(images)) writePng(path.join(root, relativePath));
  const manifestPath = path.join(root, 'evidencias', 'integracion-real.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    confirmedSharedRecord: true,
    recordLabel: 'Compra laboratorio DEMO-1407',
    images,
  }));

  const ready = await loadIntegrationManifest(manifestPath, root);
  assert.equal(ready.ready, true);
  assert.equal(ready.recordLabel, 'Compra laboratorio DEMO-1407');
  assert.deepEqual(Object.keys(ready.images), ['web', 'android', 'electron']);

  fs.writeFileSync(manifestPath, JSON.stringify({
    confirmedSharedRecord: false,
    recordLabel: 'Compra laboratorio DEMO-1407',
    images,
  }));
  assert.match((await loadIntegrationManifest(manifestPath, root)).reason, /confirmada/i);

  fs.writeFileSync(manifestPath, JSON.stringify({
    confirmedSharedRecord: true,
    recordLabel: 'Registro fuera del proyecto',
    images: { ...images, web: '../outside.png' },
  }));
  assert.match((await loadIntegrationManifest(manifestPath, root)).reason, /fuera del proyecto/i);
});
