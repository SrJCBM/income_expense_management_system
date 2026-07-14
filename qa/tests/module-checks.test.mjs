import test from 'node:test';
import assert from 'node:assert/strict';
import { getInstallerChecks } from '../checks/installer.mjs';
import { getMobileChecks } from '../checks/mobile.mjs';

test('installer separa smoke rápido y distribución completa', () => {
  assert.deepEqual(getInstallerChecks('quick').map(({ id }) => id), ['installer-smoke']);
  assert.deepEqual(getInstallerChecks('full').map(({ id }) => id), [
    'installer-smoke',
    'installer-dist',
    'installer-artifact',
    'installer-nsis-manual',
  ]);
});

test('mobile separa sincronización rápida y APK completo', () => {
  assert.deepEqual(getMobileChecks('quick').map(({ id }) => id), ['mobile-sync-dev']);
  assert.deepEqual(getMobileChecks('full').map(({ id }) => id), [
    'mobile-sync-dev',
    'mobile-apk-debug',
    'mobile-artifact',
    'mobile-emulator-smoke',
  ]);
});

test('los controles humanos nunca se presentan como comandos', () => {
  const manualChecks = [
    ...getInstallerChecks('full'),
    ...getMobileChecks('full'),
  ].filter(({ manual }) => manual);
  assert.equal(manualChecks.length, 2);
  assert.ok(manualChecks.every(({ command }) => command === undefined));
});
