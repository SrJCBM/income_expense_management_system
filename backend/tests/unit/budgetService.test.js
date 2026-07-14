import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import budgetService from '../../src/services/budgetService.js';
import Budget from '../../src/models/Budget.js';
import { ConflictError, NotFoundError } from '../../src/errors/ApplicationError.js';
import {
  clearCollections,
  insertTestUser,
  insertTestCategory,
  insertTestExpense,
} from '../helpers/dbHandler.js';
import '../setup.js';

describe('BudgetService', () => {
  let user;
  let category;

  beforeEach(async () => {
    user = await insertTestUser({ email: `budget_${Date.now()}@example.com` });
    category = await insertTestCategory({
      userId: user._id,
      name: 'Alimentación QA',
      type: 'expense',
      color: '#ff6600',
    });
  });

  afterEach(async () => {
    await clearCollections(['users', 'categories', 'expenses', 'budgets']);
  });

  it('crea y normaliza un presupuesto sin gastos', async () => {
    const result = await budgetService.createBudget(user._id, {
      categoryId: category._id,
      limitAmount: '200',
      month: '7',
      year: '2026',
    });

    expect(result.categoryId).toBe(category._id.toString());
    expect(result.spentAmount).toBe(0);
    expect(result.remainingAmount).toBe(200);
    expect(result.percentageUsed).toBe(0);
    expect(result.isOverBudget).toBe(false);
    expect(result.isNearLimit).toBe(false);
  });

  it('rechaza presupuestos duplicados por categoría y periodo', async () => {
    const data = { category: category._id, limitAmount: 100, month: 7, year: 2026 };
    await budgetService.createBudget(user._id, data);
    await expect(budgetService.createBudget(user._id, data)).rejects.toThrow(ConflictError);
  });

  it('calcula alerta cercana y respeta un umbral personalizado', async () => {
    await Budget.create({
      userId: user._id,
      category: category._id,
      limitAmount: 100,
      alertThreshold: 60,
      month: 7,
      year: 2026,
    });
    await insertTestExpense({
      userId: user._id,
      category: category._id,
      amount: 70,
      date: new Date(2026, 6, 10),
    });

    const [result] = await budgetService.getUserBudgets(user._id, { month: 7, year: 2026 });
    expect(result.percentageUsed).toBe(70);
    expect(result.remainingAmount).toBe(30);
    expect(result.isNearLimit).toBe(true);
    expect(result.isOverBudget).toBe(false);
  });

  it('marca como excedido y limita el restante a cero', async () => {
    await Budget.create({ userId: user._id, category: category._id, limitAmount: 50, month: 7, year: 2026 });
    await insertTestExpense({ userId: user._id, category: category._id, amount: 75, date: new Date(2026, 6, 10) });

    const [result] = await budgetService.getUserBudgets(user._id, { month: 7, year: 2026 });
    expect(result.remainingAmount).toBe(0);
    expect(result.isOverBudget).toBe(true);
    expect(result.isNearLimit).toBe(false);
  });

  it('actualiza el límite y devuelve el progreso recalculado', async () => {
    const budget = await Budget.create({ userId: user._id, category: category._id, limitAmount: 100, month: 7, year: 2026 });
    const result = await budgetService.updateBudget(budget._id, user._id, {
      category: category._id,
      limitAmount: 250,
      month: 7,
      year: 2026,
      alertThreshold: 90,
    });
    expect(result.limitAmount).toBe(250);
    expect(result.alertThreshold).toBe(90);
  });

  it('rechaza actualizar un presupuesto inexistente o ajeno', async () => {
    await expect(budgetService.updateBudget(new mongoose.Types.ObjectId(), user._id, {
      category: category._id,
      limitAmount: 100,
      month: 7,
      year: 2026,
    })).rejects.toThrow(NotFoundError);
  });

  it('elimina un presupuesto y rechaza una segunda eliminación', async () => {
    const budget = await Budget.create({ userId: user._id, category: category._id, limitAmount: 100, month: 7, year: 2026 });
    const result = await budgetService.deleteBudget(budget._id, user._id);
    expect(result.id).toBe(budget._id.toString());
    await expect(budgetService.deleteBudget(budget._id, user._id)).rejects.toThrow(NotFoundError);
  });

  it('devuelve únicamente presupuestos con alertas activas', async () => {
    await Budget.create({ userId: user._id, category: category._id, limitAmount: 100, alertThreshold: 50, month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const alerts = await budgetService.getBudgetAlerts(user._id);
    expect(alerts).toEqual([]);
  });
});
