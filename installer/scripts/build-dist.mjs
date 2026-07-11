#!/usr/bin/env node

/**
 * Build script para empaquetar web + backend en distribución
 * Ejecutar: node scripts/build-dist.mjs
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const installerRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(installerRoot, '..');
const webRoot = path.resolve(projectRoot, 'web');
const backendRoot = path.resolve(projectRoot, 'backend');
const distResourcesBackend = path.resolve(installerRoot, 'dist', 'resources', 'backend');

console.log('🔨 [Build] Iniciando build de distribución...\n');

try {
  // Paso 1: Build web
  console.log('📦 [1/4] Compilando web app...');
  execSync('npm run build', { cwd: webRoot, stdio: 'inherit' });

  // Copiar web/dist -> installer/dist
  const webDist = path.resolve(webRoot, 'dist');
  const installerDist = path.resolve(installerRoot, 'dist');
  copyDir(webDist, installerDist);
  console.log('✅ [1/4] Web app compilada y copiada a installer/dist\n');

  // Paso 2: Instalar dependencias del backend
  console.log('📦 [2/4] Instalando dependencias del backend (production)...');
  execSync('npm ci --omit=dev', { cwd: backendRoot, stdio: 'inherit' });
  console.log('✅ [2/4] Dependencias backend instaladas\n');

  // Paso 3: Crear carpeta resources/backend
  console.log('📁 [3/4] Copiando backend a resources...');
  mkdirSync(distResourcesBackend, { recursive: true });

  // Función recursiva para copiar
  function copyDir(src, dest) {
    mkdirSync(dest, { recursive: true });
    const files = readdirSync(src);

    files.forEach((file) => {
      if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'tests') {
        // Skip node_modules temporarily, we'll copy it separately
        return;
      }

      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      const stat = statSync(srcFile);

      if (stat.isDirectory()) {
        copyDir(srcFile, destFile);
      } else {
        copyFileSync(srcFile, destFile);
      }
    });
  }

  // Copiar archivos del backend (excepto node_modules)
  copyDir(backendRoot, distResourcesBackend);

  // Copiar node_modules
  console.log('   ↳ Copiando node_modules (esto puede tardar)...');
  const srcNodeModules = path.join(backendRoot, 'node_modules');
  const destNodeModules = path.join(distResourcesBackend, 'node_modules');
  copyDir(srcNodeModules, destNodeModules);

  console.log('✅ [3/4] Backend copiado a dist/resources/backend\n');

  // Paso 4: Construir con electron-builder
  console.log('🏗️  [4/4] Construyendo instalador con electron-builder...');
  execSync('electron-builder --win', { cwd: installerRoot, stdio: 'inherit' });
  console.log('✅ [4/4] Instalador generado\n');

  console.log('🎉 ¡Build completado!');
  console.log('📍 Instalador: dist/release/Income Expense Manager Setup 1.1.0.exe\n');
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}
