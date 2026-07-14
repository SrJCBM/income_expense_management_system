import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runArtifactCheck, runCommand } from '../lib/command-runner.mjs';

const base = { module: 'qa', cwd: '.' };

test('normaliza un proceso exitoso como PASS', async () => {
  const result = await runCommand({
    ...base,
    id: 'pass',
    name: 'Proceso exitoso',
    command: [process.execPath, '-e', 'process.exit(0)'],
  });

  assert.equal(result.status, 'PASS');
  assert.equal(result.exitCode, 0);
});

test('normaliza un proceso fallido y conserva la salida relevante', async () => {
  const result = await runCommand({
    ...base,
    id: 'fail',
    name: 'Proceso fallido',
    command: [process.execPath, '-e', "console.error('fallo esperado'); process.exit(3)"],
  });

  assert.equal(result.status, 'FAIL');
  assert.equal(result.exitCode, 3);
  assert.match(result.outputTail, /fallo esperado/);
});

test('mantiene las comprobaciones manuales como PENDING_MANUAL', async () => {
  const result = await runCommand({
    ...base,
    id: 'manual',
    name: 'Inspección manual',
    manual: true,
    reason: 'Requiere inspección visual',
  });

  assert.equal(result.status, 'PENDING_MANUAL');
  assert.equal(result.reason, 'Requiere inspección visual');
});

test('registra una omisión solicitada sin iniciar el proceso', async () => {
  const result = await runCommand({
    ...base,
    id: 'skip',
    name: 'Proceso omitido',
    command: [process.execPath, '-e', 'process.exit(9)'],
  }, { skipReason: 'dry-run' });

  assert.equal(result.status, 'SKIPPED');
  assert.equal(result.reason, 'dry-run');
});

test('valida un artefacto sin modificarlo y registra sus metadatos', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'financeapp-artifact-'));
  await writeFile(path.join(directory, 'FinanceApp.exe'), 'binary');
  const result = await runArtifactCheck({
    ...base,
    id: 'artifact',
    name: 'Instalador',
    artifact: path.join(directory, '*.exe'),
  });

  assert.equal(result.status, 'PASS');
  assert.equal(result.evidence.length, 1);
  assert.match(result.evidence[0], /FinanceApp\.exe/);
  assert.match(result.evidence[0], /6 bytes/);
});

test('ejecuta comandos npm de forma compatible con Windows', async () => {
  const result = await runCommand({
    ...base,
    id: 'npm-version',
    name: 'npm version',
    command: ['npm', '--version'],
  });
  assert.equal(result.status, 'PASS', result.reason);
  assert.match(result.outputTail, /\d+\.\d+/);
});
