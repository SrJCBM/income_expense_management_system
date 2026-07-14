import test from 'node:test';
import assert from 'node:assert/strict';
import { getWebChecks } from '../checks/web.mjs';

test('perfil quick selecciona unitarias, build y smoke', () => {
  assert.deepEqual(getWebChecks('quick').map(({ id }) => id), [
    'web-unit',
    'web-build',
    'web-e2e-smoke',
  ]);
});

test('perfil full agrega E2E completo y accesibilidad sin repetir smoke', () => {
  assert.deepEqual(getWebChecks('full').map(({ id }) => id), [
    'web-unit',
    'web-build',
    'web-e2e-smoke',
    'web-e2e',
    'web-a11y',
  ]);
});

test('rechaza perfiles desconocidos', () => {
  assert.throws(() => getWebChecks('unknown'), /Perfil no soportado/);
});
