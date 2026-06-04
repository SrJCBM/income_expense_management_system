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

    const incomes = await Income.find(query)
      .sort({ date: -1, createdAt: -1 })
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
