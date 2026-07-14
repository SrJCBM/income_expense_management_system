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

test('perfil full ejecuta las 73 pruebas Cypress una vez sin repetir smoke', () => {
  assert.deepEqual(getWebChecks('full').map(({ id }) => id), [
    'web-unit',
    'web-build',
    'web-e2e',
  ]);
});

test('rechaza perfiles desconocidos', () => {
  assert.throws(() => getWebChecks('unknown'), /Perfil no soportado/);
});
