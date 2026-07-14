import { test, expect, _electron as electron } from '@playwright/test';
import path from 'node:path';

test('abre FinanceApp y expone el bridge seguro de escritorio', async () => {
  const electronApp = await electron.launch({
    args: [path.resolve('electron/main.cjs')],
    cwd: path.resolve('.'),
    env: { ...process.env, ELECTRON: '1', FINANCEAPP_QA: '1' },
  });

  try {
    const window = await electronApp.firstWindow({ timeout: 120000 });
    await expect(window.locator('#root')).toBeVisible({ timeout: 30000 });
    await expect.poll(() => window.evaluate(() => window.desktop?.isElectron)).toBe(true);
    await expect(window).toHaveURL(/127\.0\.0\.1:3000/);
  } finally {
    await electronApp.close();
  }
});
