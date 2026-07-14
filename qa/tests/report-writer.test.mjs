import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeReports } from '../lib/report-writer.mjs';

test('genera reportes JSON y Markdown con todos los estados', async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), 'financeapp-qa-'));
  const summary = {
    startedAt: '2026-07-14T05:00:00.000Z',
    finishedAt: '2026-07-14T05:00:01.000Z',
    module: 'all',
    profile: 'quick',
    results: [
      { module: 'web', name: 'Unitarias', status: 'PASS', durationMs: 10, reason: '', evidence: [] },
      { module: 'installer', name: 'Smoke', status: 'FAIL', durationMs: 20, reason: 'exit 1', evidence: [] },
      { module: 'mobile', name: 'Emulador', status: 'PENDING_MANUAL', durationMs: 0, reason: 'Abrir APK', evidence: [] },
    ],
  };

  const paths = await writeReports(summary, outputDir);
  const json = JSON.parse(await readFile(paths.jsonPath, 'utf8'));
  const markdown = await readFile(paths.markdownPath, 'utf8');

  assert.equal(json.results.length, 3);
  assert.match(markdown, /PASS/);
  assert.match(markdown, /FAIL/);
  assert.match(markdown, /PENDING_MANUAL/);
  assert.match(markdown, /\| Módulo \| Comprobación \| Estado \|/);
});
