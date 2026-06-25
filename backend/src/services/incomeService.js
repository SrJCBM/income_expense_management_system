/**
 * Servicio de Ingresos
 */

import mongoose from 'mongoose';
import Income from '../models/Income.js';
import Category from '../models/Category.js';
import { NotFoundError, ValidationError } from '../errors/ApplicationError.js';

const mapIncomeForResponse = (incomeDocument) => {
  const income = incomeDocument.toObject ? incomeDocument.toObject() : incomeDocument;
  const categoryData = income.category && typeof income.category === 'object'
    ? income.category
    : null;

  return {
    ...income,
    id: income._id?.toString(),
    concept: income.description,
    categoryId: categoryData?._id?.toString() || income.category?.toString() || null,
    category: categoryData
      ? {
          _id: categoryData._id,
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
        }
      : income.category,
  };
};

const normalizeIncomeInput = (incomeData) => ({
  description: incomeData.description || incomeData.concept,
  amount: incomeData.amount,
  category: incomeData.category || incomeData.categoryId,
  date: normalizeTransactionDate(incomeData.date),
  notes: incomeData.notes,
});

const normalizeTransactionDate = (date) => {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T12:00:00`;
  }

  return date;
};

const ensureValidIncomeCategory = async (userId, categoryId) => {
  if (!categoryId) {
    return;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);


  const category = await Category.findOne({
    _id: categoryId,
    userId: userObjectId,
    type: 'income',
  });

  if (!category) {
    throw new ValidationError('La categoría seleccionada no es válida para ingresos');
  }
};

class IncomeService {
  async getUserIncomes(userId, filters = {}) {
    const query = { userId };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.month && filters.year) {
      const month = Number(filters.month);
      const year = Number(filters.year);

      if (Number.isInteger(month) && Number.isInteger(year)) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        query.date = {
          $gte: startDate,
          $lt: endDate,
        };
      }
    }

    if (filters.startDate || filters.endDate) {
      query.date = query.date || {};
      if (filters.startDate) {
        query.date.$gte = new Date(`${filters.startDate}T00:00:00`);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(`${filters.endDate}T23:59:59`);
      }
    }

    const minAmount = Number(filters.minAmount);
    const maxAmount = Number(filters.maxAmount);
    if (!Number.isNaN(minAmount) && filters.minAmount !== undefined && filters.minAmount !== '') {
      query.amount = { ...query.amount, $gte: minAmount };
    }
    if (!Number.isNaN(maxAmount) && filters.maxAmount !== undefined && filters.maxAmount !== '') {
      query.amount = { ...query.amount, $lte: maxAmount };
    }

    if (filters.search && String(filters.search).trim()) {
      const escaped = String(filters.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      query.$or = [{ description: searchRegex }, { notes: searchRegex }];
    }

    const sortOptions = {
      'date-desc': { date: -1, createdAt: -1 },
      'date-asc': { date: 1, createdAt: 1 },
      'amount-desc': { amount: -1 },
      'amount-asc': { amount: 1 },
    };
    const sort = sortOptions[filters.sort] || sortOptions['date-desc'];

    const incomes = await Income.find(query)
      .sort(sort)
      .populate('category', 'name type color');

    return incomes.map(mapIncomeForResponse);
  }

  // ← NUEVO
  async getIncomeById(incomeId, userId) {
    const income = await Income.findOne({ _id: incomeId, userId })
      .populate('category', 'name type color');

    if (!income) {
      throw new NotFoundError('Ingreso no encontrado');
    }

    return mapIncomeForResponse(income);
  }

  async createIncome(userId, incomeData) {
    const normalizedData = normalizeIncomeInput(incomeData);

    await ensureValidIncomeCategory(userId, normalizedData.category);

    const income = await Income.create({
      ...normalizedData,
      userId,
    });

    const populatedIncome = await Income.findById(income._id).populate(
      'category',
      'name type color'
    );

    return mapIncomeForResponse(populatedIncome);
  }

  async updateIncome(incomeId, userId, incomeData) {
    const existingIncome = await Income.findOne({ _id: incomeId, userId });

    if (!existingIncome) {
      throw new NotFoundError('Ingreso no encontrado');
    }

    const normalizedData = normalizeIncomeInput(incomeData);

    if (normalizedData.category) {
      await ensureValidIncomeCategory(userId, normalizedData.category);
    }

    const income = await Income.findOneAndUpdate(
      { _id: incomeId, userId },
      normalizedData,
      { new: true, runValidators: true }
    ).populate('category', 'name type color');

    return mapIncomeForResponse(income);
  }

  async deleteIncome(incomeId, userId) {
    const income = await Income.findOneAndDelete({ _id: incomeId, userId });

    if (!income) {
      throw new NotFoundError('Ingreso no encontrado');
    }

    return {
      id: income._id.toString(),
      concept: income.description,
    };
  }
}

export default new IncomeService();
