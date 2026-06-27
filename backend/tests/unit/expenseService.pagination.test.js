import { describe, it, expect, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Expense from '../../src/models/Expense.js';
import expenseService from '../../src/services/expenseService.js';
import { clearCollections } from '../helpers/dbHandler.js';
import '../setup.js';

const userId = new mongoose.Types.ObjectId();

afterEach(async () => {
  await clearCollections(['expenses']);
});

const makeExpense = (i) =>
  Expense.create({
    userId,
    description: `Gasto ${i}`,
    amount: i * 10,
    date: new Date(2026, 0, i + 1),
    category: new mongoose.Types.ObjectId(),
  });

describe('getUserExpenses — pagination', () => {
  it('returns first page with totalPages', async () => {
    await Promise.all(Array.from({ length: 25 }, (_, i) => makeExpense(i)));

    const result = await expenseService.getUserExpenses(userId, { page: 1, limit: 10 });

    expect(result.data).toHaveLength(10);
    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
  });

  it('returns second page correctly', async () => {
    await Promise.all(Array.from({ length: 25 }, (_, i) => makeExpense(i)));

    const result = await expenseService.getUserExpenses(userId, { page: 2, limit: 10 });

    expect(result.data).toHaveLength(10);
    expect(result.page).toBe(2);
  });

  it('defaults to page 1, limit 20 when not provided', async () => {
    await Promise.all(Array.from({ length: 5 }, (_, i) => makeExpense(i)));

    const result = await expenseService.getUserExpenses(userId, {});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.data).toHaveLength(5);
    expect(result.total).toBe(5);
  });
});
