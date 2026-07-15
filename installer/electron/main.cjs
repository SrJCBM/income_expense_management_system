const { app, BrowserWindow, net, protocol } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {
  APP_SCHEME,
  APP_URL,
  registerAppProtocol,
} = require('./app-protocol.cjs');

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const isDev = process.env.ELECTRON === '1' || !app.isPackaged;
const isQa = process.env.FINANCEAPP_QA === '1';
const WEB_URL = 'http://127.0.0.1:3000';
const BACKEND_URL = 'http://127.0.0.1:5000/api/health';
const LOG_FILE = path.join(app.getPath('userData'), 'app-error.log');

let mainWindow = null;
let backendProcess = null;
let webProcess = null;

function logError(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  console.error(message);
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function waitForUrl(url, timeoutMs = 60000, intervalMs = 500) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Timeout esperando ${url} after ${timeoutMs}ms`));
        return;
      }
      setTimeout(attempt, intervalMs);
    };

    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on('error', retry);
      request.setTimeout(2000, () => {
        request.destroy();
        retry();
      });
    };

    attempt();
  });
}

function spawnNpmScript(cwd, script, args = []) {
  const command = `${getNpmCommand()} run ${script} ${args.join(' ')}`.trim();

  return spawn(command, {
    cwd,
    env: { ...process.env },
    stdio: 'pipe',
    windowsHide: true,
    shell: true,
  });
}

function pipeLogs(prefix, child) {
  if (!child) return;

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${prefix}] ${chunk}`);
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${prefix}] ${chunk}`);
  });
  child.on('exit', (code) => {
    const normalizedCode = code === null ? 'null' : String(code);
    console.log(`[${prefix}] proceso finalizado con codigo ${normalizedCode}`);
  });
}

async function startDevProcesses() {
  const installerRoot = path.resolve(__dirname, '..');
  const projectRoot = path.resolve(installerRoot, '..');
  const webRoot = path.resolve(projectRoot, 'web');
  const backendRoot = path.resolve(projectRoot, 'backend');

  logError('Starting dev backend process...');
  backendProcess = spawnNpmScript(backendRoot, 'dev');
  pipeLogs('backend', backendProcess);

  logError('Starting dev web process...');
  webProcess = spawnNpmScript(webRoot, 'dev', ['--', '--host', '127.0.0.1', '--port', '3000']);
  pipeLogs('web', webProcess);

  logError('Waiting for backend health check...');
  await waitForUrl(BACKEND_URL, 90000);
  logError('Waiting for web...');
  await waitForUrl(WEB_URL, 90000);
}

function stopChild(child) {
  if (!child || child.killed) return;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { windowsHide: true });
    return;
  }

  child.kill('SIGTERM');
}

function stopAllChildren() {
  stopChild(backendProcess);
  stopChild(webProcess);
  backendProcess = null;
  webProcess = null;
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

  if (isDev || isQa) {
    mainWindow.loadURL(WEB_URL);
  } else {
    mainWindow.loadURL(APP_URL);
  }
}

app.whenReady().then(async () => {
  logError('App ready - starting initialization...');

  try {
    if (isQa) {
      logError('Starting in QA mode with externally managed web server');
    } else if (isDev) {
      logError('Starting in DEV mode');
      await startDevProcesses();
    } else {
      logError('Starting in PRODUCTION mode with shared API');
      registerAppProtocol({
        protocol,
        net,
        rootDir: path.join(app.getAppPath(), 'dist'),
      });
    }

    createMainWindow();
    logError('Initialization completed successfully');

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  } catch (error) {
    logError(`[electron] startup error: ${error.message}`);
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
