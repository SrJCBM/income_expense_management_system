import { describe, it, expect, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Income from '../../src/models/Income.js';
import incomeService from '../../src/services/incomeService.js';
import { clearCollections } from '../helpers/dbHandler.js';
import '../setup.js';

const userId = new mongoose.Types.ObjectId();

afterEach(async () => {
  await clearCollections(['incomes']);
});

const makeIncome = (i) =>
  Income.create({
    userId,
    description: `Ingreso ${i}`,
    amount: i * 10,
    date: new Date(2026, 0, i + 1),
    category: new mongoose.Types.ObjectId(),
  });

describe('getUserIncomes — pagination', () => {
  it('returns first page with totalPages', async () => {
    await Promise.all(Array.from({ length: 25 }, (_, i) => makeIncome(i)));

    const result = await incomeService.getUserIncomes(userId, { page: 1, limit: 10 });

    expect(result.data).toHaveLength(10);
    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
  });

  it('defaults to page 1, limit 20 when not provided', async () => {
    await Promise.all(Array.from({ length: 5 }, (_, i) => makeIncome(i)));

    const result = await incomeService.getUserIncomes(userId, {});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.data).toHaveLength(5);
  });
});
