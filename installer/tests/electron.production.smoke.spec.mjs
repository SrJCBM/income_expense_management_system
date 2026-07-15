import { _electron as electron, expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const installerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executablePath = path.join(installerRoot, 'release', 'win-unpacked', 'FinanceApp.exe');

test('el release abre la interfaz desde app://financeapp', async () => {
  const electronApp = await electron.launch({ executablePath });

  try {
    const page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');

    await expect.poll(() => page.url()).toBe('app://financeapp/');
    await expect(page.locator('body')).toContainText(/FinanceApp|Iniciar sesi[oó]n/i);
  } finally {
    await electronApp.close();
  }
});
