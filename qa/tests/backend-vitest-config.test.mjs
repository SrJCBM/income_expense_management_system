import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../../backend/vitest.config.js';

test('backend serializa archivos que crean MongoMemoryServer', () => {
  assert.equal(config.test.fileParallelism, false);
  assert.equal(config.test.maxWorkers, 1);
  assert.equal('threads' in config.test, false);
});

test('backend aplica los umbrales de cobertura con el formato de Vitest 4', () => {
  assert.deepEqual(config.test.coverage.thresholds, {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  });
  assert.equal(config.test.coverage.lines, undefined);
});
