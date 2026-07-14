import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');

function run(...args) {
  return spawnSync(process.execPath, ['qa/run-tests.mjs', ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('rechaza módulos y perfiles desconocidos con código 2', () => {
  assert.equal(run('backend', '--dry-run').status, 2);
  assert.equal(run('web', '--profile', 'slow', '--dry-run').status, 2);
});

test('quick es el perfil predeterminado y dry-run genera reportes', () => {
  const result = run('web', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Perfil: quick/);
  assert.match(result.stdout, /Reporte Markdown:/);

  const reportsDir = path.join(root, 'qa', 'reports');
  const latestJson = readdirSync(reportsDir).filter((name) => name.endsWith('.json')).sort().at(-1);
  const report = JSON.parse(readFileSync(path.join(reportsDir, latestJson), 'utf8'));
  assert.equal(report.results.length, 3);
  assert.ok(report.results.every(({ status }) => status === 'SKIPPED'));
});

test('all full incluye controles manuales sin aprobarlos', () => {
  const result = run('all', '--profile', 'full', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /PENDING_MANUAL: 2/);
});
