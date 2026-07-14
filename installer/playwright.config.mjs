import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 150000,
  workers: 1,
  retries: 0,
  outputDir: 'test-results/artifacts',
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  webServer: {
    command: 'npm --prefix ../web run dev -- --host 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000/#/login',
    timeout: 120000,
    reuseExistingServer: false,
  },
});
