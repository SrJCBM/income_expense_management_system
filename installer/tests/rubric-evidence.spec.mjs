import { test, expect, _electron as electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const APP_URL = 'http://127.0.0.1:3000';
const OUTPUT_DIR = path.resolve('../evidencias/capturas-rubrica');
const TOKEN = 'evidencia-local-sin-valor-real';
const USER = { id: 'demo-espe', name: 'Cuenta Demo ESPE', email: 'demo@example.com' };
const EXPENSE_CATEGORY_ID = '665f1a111111111111111111';
const INCOME_CATEGORY_ID = '775f1a111111111111111111';

const expenseCategory = {
  id: EXPENSE_CATEGORY_ID,
  _id: EXPENSE_CATEGORY_ID,
  name: 'Demostracion ESPE',
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
  notes: 'Resultado correspondiente a marzo',
  categoryId: EXPENSE_CATEGORY_ID,
  category: expenseCategory,
};

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

async function installDeterministicApi(page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

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
          expensesByCategory: [{ name: 'Demostracion ESPE', amount: 9999999999.99 }],
        },
      });
    }
    if (pathname.endsWith('/incomes')) return json(route, { success: true, data: [sampleIncome] });
    if (pathname.endsWith('/expenses')) return json(route, { success: true, data: [sampleExpense] });
    if (pathname.endsWith('/categories')) {
      const type = url.searchParams.get('type');
      const data = type === 'income' ? [incomeCategory] : type === 'expense' ? [expenseCategory] : [expenseCategory, incomeCategory];
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

async function capture(page, filename) {
  await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: true });
}

test('genera evidencia visual de las observaciones corregidas', async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const electronApp = await electron.launch({
    args: [path.resolve('electron/main.cjs')],
    cwd: path.resolve('.'),
    env: { ...process.env, ELECTRON: '1', FINANCEAPP_QA: '1' },
  });

  try {
    const page = await electronApp.firstWindow({ timeout: 120000 });
    await page.setViewportSize({ width: 1280, height: 800 });
    await installDeterministicApi(page);

    await page.goto(`${APP_URL}/#/register`);
    await page.getByTestId('name-input').fill('!@#$%^&*');
    await page.getByTestId('email-input').fill('evidencia@example.com');
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Password123!');
    await page.getByTestId('register-button').click();
    await expect(page.getByTestId('register-error-name')).toContainText('letra');
    await capture(page, '01-nombre-solo-simbolos-rechazado.png');

    await openProtected(page, '/incomes');
    await expect(page.getByTestId('income-list')).toBeVisible();
    await page.getByTestId('edit-income').first().click();
    await expect(page.getByTestId('income-concept')).toHaveValue('Salario de marzo');
    await expect(page.getByTestId('income-amount')).toHaveValue('1100');
    await expect(page.getByTestId('income-date')).toHaveValue('2026-03-15');
    await expect(page.getByTestId('income-notes')).toHaveValue('Ingreso usado para demostrar la fecha estable');
    await capture(page, '02-edicion-ingreso-datos-precargados.png');
    await capture(page, '03-fecha-ingreso-sin-desfase.png');

    await openProtected(page, '/expenses');
    await expect(page.getByTestId('expense-list')).toBeVisible();
    await page.getByTestId('filter-category').selectOption(EXPENSE_CATEGORY_ID);
    await page.getByTestId('filter-month').fill('2026-03');
    await page.getByTestId('apply-filters').click();
    await expect(page.getByTestId('expense-list')).toContainText('Materiales de laboratorio');
    await expect(page.getByTestId('expense-list')).toContainText('2026-03-10');
    await capture(page, '04-filtros-categoria-y-mes-aplicados.png');
    await capture(page, '05-marzo-presente-en-resultados.png');

    await page.getByTestId('new-expense-button').click();
    await expect(page.getByTestId('expense-form')).toBeVisible();
    await expect(page.getByTestId('expense-category')).toHaveCount(1);
    await capture(page, '06-selector-categoria-unico.png');

    await openProtected(page, '/');
    await expect(page.getByTestId('dashboard-incomes-amount')).toContainText('999');
    await expect(page.getByTestId('dashboard-expenses-amount')).toContainText('999');
    const cardsContainAmounts = await page.locator('.dashboard-card .amount').evaluateAll((elements) =>
      elements.every((element) => element.scrollWidth <= element.clientWidth + 1)
    );
    expect(cardsContainAmounts).toBe(true);
    await capture(page, '07-montos-altos-representados.png');
    await capture(page, '08-montos-altos-sin-desbordamiento.png');

    await openProtected(page, '/categories');
    await expect(page.getByTestId('category-list')).toBeVisible();
    await page.getByTestId('new-category-button').click();
    const iconButtons = page.locator('.icon-btn');
    await expect(iconButtons).not.toHaveCount(0);
    await iconButtons.nth(5).click();
    const selectedIcon = await page.getByTestId('category-icon').inputValue();
    expect(selectedIcon.length).toBeGreaterThan(0);
    await expect(page.locator('.icon-btn-selected')).toHaveCount(1);
    await capture(page, '10-icono-categoria-seleccionado.png');
  } finally {
    await electronApp.close();
  }
});
