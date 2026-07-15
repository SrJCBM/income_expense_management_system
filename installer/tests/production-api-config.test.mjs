import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const installerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = path.resolve(installerRoot, '..');

test('desktop-prod usa exclusivamente la API compartida de Render', async () => {
  const env = await readFile(path.join(projectRoot, 'web', '.env.desktop-prod'), 'utf8');

  assert.match(env, /^VITE_API_URL=https:\/\/income-expense-api-hgsu\.onrender\.com\/api$/m);
  assert.doesNotMatch(env, /localhost|127\.0\.0\.1/i);
  assert.doesNotMatch(env, /JWT|MONGODB|SECRET/i);
});

test('build:dist compila el modo desktop-prod sin copiar el backend', async () => {
  const script = await readFile(path.join(installerRoot, 'scripts', 'build-dist.ps1'), 'utf8');

  assert.match(script, /npm run build -- --mode desktop-prod/);
  assert.doesNotMatch(script, /backendRoot|distResourcesBackend|node_modules|\.env\.example/i);
});

test('electron-builder empaqueta solo el cliente web y Electron', async () => {
  const packageJson = JSON.parse(await readFile(path.join(installerRoot, 'package.json'), 'utf8'));

  assert.deepEqual(packageJson.build.files, ['dist/**/*', 'electron/**/*', 'package.json']);
  assert.equal(packageJson.build.extraResources, undefined);
});

test('produccion registra app://financeapp y no inicia un backend local', async () => {
  const main = await readFile(path.join(installerRoot, 'electron', 'main.cjs'), 'utf8');

  assert.match(main, /registerSchemesAsPrivileged/);
  assert.match(main, /registerAppProtocol/);
  assert.match(main, /loadURL\(APP_URL\)/);
  assert.doesNotMatch(main, /startBackendProduction|getBackendPath|resourcesPath[^\n]*backend/);
});

test('desarrollo conserva y detiene ambos procesos hijos', async () => {
  const main = await readFile(path.join(installerRoot, 'electron', 'main.cjs'), 'utf8');

  assert.match(main, /let backendProcess = null;/);
  assert.match(main, /backendProcess = spawnNpmScript/);
  assert.match(main, /stopChild\(backendProcess\)/);
  assert.match(main, /stopChild\(webProcess\)/);
});
