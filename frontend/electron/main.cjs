const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');
const fs = require('fs');
const Module = require('module');

const isDev = process.env.ELECTRON === '1' || !app.isPackaged;

const FRONTEND_URL = 'http://127.0.0.1:3000';
const BACKEND_URL = 'http://127.0.0.1:5000/api/health';
const LOG_FILE = path.join(app.getPath('userData'), 'app-error.log');

function logError(msg) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${msg}\n`;
  console.error(msg);
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
}

let mainWindow = null;
let frontendProcess = null;

function getBackendPath() {
  if (isDev) {
    const frontendRoot = path.resolve(__dirname, '..');
    const projectRoot = path.resolve(frontendRoot, '..');
    return path.resolve(projectRoot, 'backend');
  }
  // Produccion: backend copiado como extraResources fuera de app.asar
  return path.join(process.resourcesPath, 'backend');
}

function getFrontendEntry() {
  if (isDev) {
    return FRONTEND_URL;
  }
  return path.join(app.getAppPath(), 'dist', 'index.html');
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function waitForUrl(url, timeoutMs = 60000, intervalMs = 500) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      req.on('error', retry);
      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Timeout esperando ${url} after ${timeoutMs}ms`));
        return;
      }
      setTimeout(attempt, intervalMs);
    };

    attempt();
  });
}

function spawnNpmScript(cwd, script, args = []) {
  const cmd = `${getNpmCommand()} run ${script} ${args.join(' ')}`.trim();

  return spawn(cmd, {
    cwd,
    env: { ...process.env },
    stdio: 'pipe',
    windowsHide: true,
    shell: true,
  });
}

function pipeLogs(prefix, child) {
  if (!child) {
    return;
  }

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${prefix}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${prefix}] ${chunk}`);
  });

  child.on('exit', (code) => {
    const normalizedCode = code === null ? 'null' : String(code);
    console.log(`[${prefix}] proceso finalizado con código ${normalizedCode}`);
  });
}

async function startBackendProduction() {
  const backendRoot = getBackendPath();
  const serverScript = path.join(backendRoot, 'server.js');
  const nodeModulesPath = path.join(backendRoot, 'node_modules');

  logError(`Starting backend from: ${backendRoot}`);
  logError(`Server script path: ${serverScript}`);
  logError(`Node modules path: ${nodeModulesPath}`);

  // Verificar que los archivos existen
  if (!fs.existsSync(serverScript)) {
    throw new Error(`Server script not found: ${serverScript}`);
  }
  logError(`✓ Server script exists`);

  if (!fs.existsSync(nodeModulesPath)) {
    throw new Error(`Node modules not found: ${nodeModulesPath}`);
  }
  logError(`✓ Node modules directory exists`);

  process.env.NODE_ENV = 'production';
  process.env.PORT = process.env.PORT || '5000';

  try {
    logError('Changing working directory to backend root...');
    const oldCwd = process.cwd();
    process.chdir(backendRoot);
    logError(`✓ Changed cwd from ${oldCwd} to ${process.cwd()}`);

    logError('Importing backend server module...');
    const serverModule = pathToFileURL(serverScript).href;
    logError(`Module URL: ${serverModule}`);
    
    // El import ahora resolverá node_modules relativamente a backendRoot
    await import(serverModule);
    logError('✓ Backend module imported successfully');
  } catch (err) {
    logError(`Backend import error: ${err.message}`);
    logError(`Stack: ${err.stack}`);
    throw err;
  }

  logError('Waiting for backend health check...');
  return waitForUrl(BACKEND_URL, 30000);
}

async function startDevProcesses() {
  const frontendRoot = path.resolve(__dirname, '..');
  const projectRoot = path.resolve(frontendRoot, '..');
  const backendRoot = path.resolve(projectRoot, 'backend');

  logError('Starting dev backend process...');
  const backendProcess = spawnNpmScript(backendRoot, 'dev');
  pipeLogs('backend', backendProcess);

  logError('Starting dev frontend process...');
  frontendProcess = spawnNpmScript(frontendRoot, 'dev', ['--', '--host', '127.0.0.1', '--port', '3000']);
  pipeLogs('frontend', frontendProcess);

  logError('Waiting for backend health check...');
  await waitForUrl(BACKEND_URL, 90000);
  logError('Waiting for frontend...');
  await waitForUrl(FRONTEND_URL, 90000);
}

function stopChild(child) {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
    return;
  }

  child.kill('SIGTERM');
}

function stopAllChildren() {
  stopChild(frontendProcess);
  frontendProcess = null;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.loadURL(FRONTEND_URL);
  } else {
    mainWindow.loadFile(getFrontendEntry());
  }
}

app.whenReady().then(async () => {
  logError('App ready - starting initialization...');

  try {
    if (isDev) {
      logError('Starting in DEV mode');
      await startDevProcesses();
    } else {
      logError('Starting in PRODUCTION mode');
      // Producción: lanzar backend compilado
      await startBackendProduction();
    }

    logError('Backend started successfully, creating main window');
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  } catch (error) {
    const errorMsg = `[electron] startup error: ${error.message}`;
    logError(errorMsg);
    logError(`Stack: ${error.stack}`);
    stopAllChildren();
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopAllChildren();
});
