import { _electron as electron, chromium, expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import {
  getArtifactMetadata,
  isPng,
  loadIntegrationManifest,
  readLogSummary,
} from './helpers/presentation-evidence-support.mjs';

const APP_URL = 'http://127.0.0.1:3000';
const PROJECT_ROOT = path.resolve('..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'evidencias', 'capturas-presentacion');
const LOG_DIR = path.join(OUTPUT_DIR, 'logs');
const TOKEN = 'evidencia-controlada-sin-valor-real';
const USER = { id: 'demo-presentacion', name: 'Cuenta Demo ESPE', email: 'demo@example.com' };
const EXPENSE_CATEGORY_ID = '665f1a111111111111111111';
const INCOME_CATEGORY_ID = '775f1a111111111111111111';

const expenseCategory = {
  id: EXPENSE_CATEGORY_ID,
  _id: EXPENSE_CATEGORY_ID,
  name: 'Demostración ESPE',
  type: 'expense',
  color: '#ef4444',
  icon: '📌',
};

const incomeCategory = {
  id: INCOME_CATEGORY_ID,
  _id: INCOME_CATEGORY_ID,
  name: 'Salario',
  type: 'income',
  color: '#10b981',
  icon: '💰',
};

const sampleIncome = {
  id: 'income-march',
  _id: 'income-march',
  concept: 'Salario de marzo',
  description: 'Salario de marzo',
  amount: 1100,
  date: '2026-03-15T12:00:00.000Z',
  notes: 'Ingreso usado para demostrar la fecha estable',
  categoryId: INCOME_CATEGORY_ID,
  category: incomeCategory,
};

const sampleExpense = {
  id: 'expense-march',
  _id: 'expense-march',
  concept: 'Materiales de laboratorio',
  description: 'Materiales de laboratorio',
  amount: 125.5,
  date: '2026-03-10T12:00:00.000Z',
  notes: 'Registro controlado para la presentación',
  categoryId: EXPENSE_CATEGORY_ID,
  category: expenseCategory,
};

const EXPECTED_OUTPUTS = [
  '01-fecha-edicion-recorte.png',
  '02-filtro-marzo-resultado-recorte.png',
  '03-montos-altos-limites.png',
  '04-error-comunicacion.png',
  '05-comunicacion-recuperada.png',
  '06-web-datos-deterministas.png',
  '07-electron-datos-deterministas.png',
  '08-resultados-pruebas.png',
  '09-artefactos-distribuibles.png',
];

const output = (filename) => path.join(OUTPUT_DIR, filename);
const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

function apiState() {
  return { communicationFails: false };
}

async function installDeterministicApi(page, state) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (state.communicationFails && pathname.endsWith('/expenses')) return route.abort('connectionrefused');
    if (pathname.endsWith('/auth/me')) return json(route, USER);
    if (pathname.endsWith('/budgets/alerts')) return json(route, { success: true, data: [] });
    if (pathname.endsWith('/reports/filters')) {
      return json(route, {
        success: true,
        data: {
          years: [2026],
          monthsByYear: { 2026: [3] },
          suggestedMonth: 3,
          suggestedYear: 2026,
          hasData: true,
        },
      });
    }
    if (pathname.endsWith('/reports/yearly')) {
      return json(route, {
        success: true,
        data: {
          year: 2026,
          months: Array.from({ length: 12 }, (_, index) => ({
            month: index + 1,
            income: index === 2 ? 1100 : 0,
            expense: index === 2 ? 125.5 : 0,
            balance: index === 2 ? 974.5 : 0,
          })),
          totals: { totalIncome: 1100, totalExpense: 125.5, balance: 974.5 },
        },
      });
    }
    if (pathname.endsWith('/reports/summary')) {
      return json(route, {
        success: true,
        data: {
          totalIncome: 9999999999.99,
          totalExpense: 9999999999.99,
          balance: 0,
          netBalance: 0,
          expensesByCategory: [{ name: 'Demostración ESPE', amount: 9999999999.99 }],
        },
      });
    }
    if (pathname.endsWith('/incomes')) return json(route, { success: true, data: [sampleIncome] });
    if (pathname.endsWith('/expenses')) {
      return json(route, {
        success: true,
        data: [sampleExpense],
        pagination: { page: 1, totalPages: 1, total: 1 },
      });
    }
    if (pathname.endsWith('/categories')) {
      const type = url.searchParams.get('type');
      const data = type === 'income'
        ? [incomeCategory]
        : type === 'expense'
          ? [expenseCategory]
          : [expenseCategory, incomeCategory];
      return json(route, { success: true, data });
    }
    return json(route, { success: true, data: [] });
  });
}

async function openProtected(page, hashPath) {
  await page.goto(`${APP_URL}/#/login`);
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('appLanguage', 'es');
  }, { token: TOKEN, user: USER });
  await page.goto(`${APP_URL}/#${hashPath}`);
}

async function captureUnion(page, locators, filename, padding = 24) {
  const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()));
  if (boxes.some((box) => !box)) throw new Error(`No se pudo calcular el recorte ${filename}`);
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));
  const viewport = page.viewportSize();
  const clip = {
    x: Math.max(0, left - padding),
    y: Math.max(0, top - padding),
    width: Math.min(viewport.width, right + padding) - Math.max(0, left - padding),
    height: Math.min(viewport.height, bottom + padding) - Math.max(0, top - padding),
  };
  await page.screenshot({ path: output(filename), clip });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function boardShell(title, eyebrow, content) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} body{margin:0;width:1600px;height:900px;overflow:hidden;background:#0f1226;color:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif}
    main{height:100%;padding:72px 88px;background:radial-gradient(circle at 90% 8%,#7c3aed44,transparent 32%),radial-gradient(circle at 10% 90%,#ec489933,transparent 34%)}
    .eyebrow{color:#c4b5fd;text-transform:uppercase;letter-spacing:.18em;font-weight:800;font-size:18px}.title{font-size:54px;line-height:1.05;margin:14px 0 42px;max-width:1180px}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.card{min-height:240px;padding:28px;border:1px solid #ffffff22;border-radius:22px;background:#ffffff0e;box-shadow:0 18px 60px #0004}
    .card h2{font-size:24px;margin:0 0 18px}.metric{font-size:46px;font-weight:850;margin:10px 0}.meta{font-size:18px;color:#cbd5e1;line-height:1.45}.pass{color:#5eead4}.pending{color:#fbbf24}.absent{color:#fda4af}
    .tag{display:inline-block;padding:7px 12px;border-radius:999px;background:#7c3aed55;color:#ddd6fe;font-size:14px;font-weight:700;margin-bottom:16px}.wide{grid-column:span 3;min-height:150px}.hash{font-family:Consolas,monospace;font-size:14px;word-break:break-all;color:#cbd5e1}
    .triple{display:grid;grid-template-columns:1fr .55fr 1fr;gap:30px;align-items:center}.shot{background:#050816;border:1px solid #ffffff26;border-radius:20px;padding:12px}.shot img{width:100%;max-height:520px;object-fit:contain;display:block}.phone{border:10px solid #111827;border-radius:36px;padding:5px}
    footer{position:absolute;left:88px;bottom:42px;color:#94a3b8;font-size:16px}
  </style></head><body><main><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1 class="title">${escapeHtml(title)}</h1>${content}<footer>FinanceApp · Evidencia generada localmente · 14/07/2026</footer></main></body></html>`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

async function renderResultsBoard(page) {
  const qa = readLogSummary(path.join(LOG_DIR, '01-framework-qa.txt'));
  const smoke = readLogSummary(path.join(LOG_DIR, '02-electron-smoke.txt'));
  const rubric = readLogSummary(path.join(LOG_DIR, '03-rubrica-playwright.txt'));
  const dryRun = readLogSummary(path.join(LOG_DIR, '04-qa-full-dry-run.txt'));
  const executed = [qa, smoke, rubric].filter((item) => item.exists).length;
  const content = `<div class="grid">
    <section class="card"><span class="tag">Ejecutado ahora</span><h2>Framework QA</h2><div class="metric ${qa.exists ? 'pass' : 'pending'}">${qa.exists ? `${qa.pass} PASS` : 'Sin log'}</div><p class="meta">Pruebas del núcleo, comandos, adaptadores y reportes.</p></section>
    <section class="card"><span class="tag">Ejecutado ahora</span><h2>Electron + Playwright</h2><div class="metric ${smoke.exists ? 'pass' : 'pending'}">${smoke.exists ? 'Log real' : 'Sin log'}</div><p class="meta">Smoke del bridge seguro y evidencia de correcciones.</p></section>
    <section class="card"><span class="tag">Simulado / omitido</span><h2>Perfil QA completo</h2><div class="metric ${dryRun.exists ? 'pending' : 'pending'}">Dry-run</div><p class="meta">${dryRun.exists ? `${dryRun.skipped} comprobaciones omitidas de forma explícita.` : 'Se genera al ejecutar el coordinador.'}</p></section>
    <section class="card wide"><span class="tag">Resultado consolidado 2026-07-14</span><div class="grid"><div><h2>Backend</h2><div class="metric pass">436/436</div></div><div><h2>Web E2E</h2><div class="metric pass">73/73</div></div><div><h2>Logs del lote</h2><div class="metric">${executed}/3</div></div></div><p class="meta">Las cifras 436 y 73 provienen del resultado consolidado fechado; no se volvieron a ejecutar únicamente para producir esta imagen.</p></section>
  </div>`;
  await page.setContent(boardShell('Resultados verificables, sin inflar el alcance', 'Pruebas y trazabilidad', content));
  await page.screenshot({ path: output('08-resultados-pruebas.png') });
}

async function renderArtifactsBoard(page) {
  const artifacts = await Promise.all([
    getArtifactMetadata(path.join(PROJECT_ROOT, 'installer', 'release', 'FinanceApp Setup 1.2.0.exe')),
    getArtifactMetadata(path.join(PROJECT_ROOT, 'mobile', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')),
  ]);
  const cards = artifacts.map((artifact) => artifact.exists
    ? `<section class="card"><span class="tag">Existe en disco</span><h2>${escapeHtml(artifact.name)}</h2><div class="metric pass">${formatBytes(artifact.sizeBytes)}</div><p class="meta">Fecha: ${escapeHtml(artifact.modifiedAt.slice(0, 19).replace('T', ' '))}</p><p class="hash">SHA-256: ${artifact.sha256}</p></section>`
    : `<section class="card"><span class="tag">Comprobación local</span><h2>${escapeHtml(artifact.name)}</h2><div class="metric absent">Ausente</div><p class="meta">No se generó información simulada.</p></section>`).join('');
  const content = `<div class="grid">${cards}<section class="card"><span class="tag">Criterio</span><h2>Artefactos defendibles</h2><div class="metric">2 formatos</div><p class="meta">Instalador NSIS para Windows y APK debug para Android, identificados por hash.</p></section></div>`;
  await page.setContent(boardShell('Entregables comprobados desde el sistema de archivos', 'Distribución', content));
  await page.screenshot({ path: output('09-artefactos-distribuibles.png') });
}

function imageDataUrl(filePath) {
  return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
}

async function renderIntegrationBoard(page) {
  const manifest = await loadIntegrationManifest(
    path.join(PROJECT_ROOT, 'evidencias', 'integracion-real.json'),
    PROJECT_ROOT,
  );
  if (!manifest.ready) {
    console.log(`Integración real no compuesta: ${manifest.reason}`);
    return;
  }
  const content = `<div class="triple">
    <div><div class="shot"><img src="${imageDataUrl(manifest.images.web)}" alt="FinanceApp web"></div><h2>Web</h2></div>
    <div><div class="shot phone"><img src="${imageDataUrl(manifest.images.android)}" alt="FinanceApp Android"></div><h2>Android</h2></div>
    <div><div class="shot"><img src="${imageDataUrl(manifest.images.electron)}" alt="FinanceApp Electron"></div><h2>Electron</h2></div>
  </div><p class="meta"><strong>${escapeHtml(manifest.recordLabel)}</strong> · Una API · Una cuenta · Un estado compartido</p>`;
  await page.setContent(boardShell('El mismo registro en los tres clientes', 'Integración real confirmada', content));
  await page.screenshot({ path: output('10-integracion-real-web-android-electron.png') });
}

test('genera las capturas trazables para la presentación', async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.rmSync(output('10-integracion-real-web-android-electron.png'), { force: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const webPage = await context.newPage();
  const webState = apiState();
  await installDeterministicApi(webPage, webState);

  try {
    await openProtected(webPage, '/incomes');
    await expect(webPage.getByTestId('income-list')).toBeVisible();
    await webPage.getByTestId('edit-income').first().click();
    await expect(webPage.getByTestId('income-date')).toHaveValue('2026-03-15');
    await captureUnion(webPage, [webPage.getByTestId('income-date').locator('xpath=..')], '01-fecha-edicion-recorte.png', 34);

    await openProtected(webPage, '/expenses');
    await expect(webPage.getByTestId('expense-list')).toContainText('Materiales de laboratorio');
    await webPage.getByTestId('filter-category').selectOption(EXPENSE_CATEGORY_ID);
    await webPage.getByTestId('filter-month').fill('2026-03');
    await webPage.getByTestId('apply-filters').click();
    await expect(webPage.getByTestId('expense-item')).toContainText('2026-03-10');
    await captureUnion(webPage, [webPage.getByTestId('expense-filters'), webPage.getByTestId('expense-item').first()], '02-filtro-marzo-resultado-recorte.png', 18);

    await openProtected(webPage, '/');
    await expect(webPage.getByTestId('dashboard-incomes-amount')).toContainText('999');
    await webPage.locator('.dashboard-grid').screenshot({ path: output('03-montos-altos-limites.png') });

    webState.communicationFails = true;
    await openProtected(webPage, '/expenses');
    const communicationError = webPage.getByTestId('expense-list-error');
    await expect(communicationError).toContainText('No se pudo conectar');
    await expect(communicationError).toBeVisible();
    await expect.poll(() => communicationError.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    await webPage.screenshot({ path: output('04-error-comunicacion.png') });
    webState.communicationFails = false;
    await webPage.reload();
    await expect(webPage.getByTestId('expense-list')).toContainText('Materiales de laboratorio');
    await webPage.screenshot({ path: output('05-comunicacion-recuperada.png') });
    await webPage.screenshot({ path: output('06-web-datos-deterministas.png') });

    const electronApp = await electron.launch({
      args: [path.resolve('electron/main.cjs')],
      cwd: path.resolve('.'),
      env: { ...process.env, ELECTRON: '1', FINANCEAPP_QA: '1' },
    });
    try {
      const electronPage = await electronApp.firstWindow({ timeout: 120000 });
      await electronPage.setViewportSize({ width: 1280, height: 800 });
      await installDeterministicApi(electronPage, apiState());
      await openProtected(electronPage, '/expenses');
      await expect(electronPage.getByTestId('expense-list')).toContainText('Materiales de laboratorio');
      await electronPage.screenshot({ path: output('07-electron-datos-deterministas.png') });
    } finally {
      await electronApp.close();
    }

    await webPage.setViewportSize({ width: 1600, height: 900 });
    await renderResultsBoard(webPage);
    await renderArtifactsBoard(webPage);
    await renderIntegrationBoard(webPage);

    for (const filename of EXPECTED_OUTPUTS) {
      expect(isPng(output(filename)), `${filename} debe ser un PNG válido`).toBe(true);
    }
  } finally {
    await browser.close();
  }
});
