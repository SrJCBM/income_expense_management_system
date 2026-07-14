import test from 'node:test';
import assert from 'node:assert/strict';
import { runCommand } from '../lib/command-runner.mjs';

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
