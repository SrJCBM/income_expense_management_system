/**
 * Servicio de Gastos
 * Lógica de negocio para gastos
 */

import Expense from '../models/Expense.js';
import { NotFoundError } from '../errors/ApplicationError.js';

const mapExpenseForResponse = (expenseDocument) => {
  const expense = expenseDocument.toObject ? expenseDocument.toObject() : expenseDocument;
  const categoryData = expense.category && typeof expense.category === 'object'
    ? expense.category
    : null;

  return {
    ...expense,
    id: expense._id?.toString(),
    concept: expense.description,
    categoryId: categoryData?._id?.toString() || expense.category?.toString() || null,
    category: categoryData
      ? {
          _id: categoryData._id,
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
        }
      : expense.category,
  };
};

const normalizeExpenseInput = (expenseData) => {
  const normalized = {
    description: expenseData.description || expenseData.concept,
    amount: expenseData.amount,
    category: expenseData.category || expenseData.categoryId,
    date: normalizeTransactionDate(expenseData.date),
    notes: expenseData.notes,
    clientRequestId: normalizeClientRequestId(expenseData.clientRequestId),
  };

  if (Array.isArray(expenseData.tags)) {
    normalized.tags = expenseData.tags;
  }

  return normalized;
};

const normalizeClientRequestId = (clientRequestId) => {
  if (typeof clientRequestId !== 'string') {
    return null;
  }

  const trimmed = clientRequestId.trim();
  return trimmed || null;
};

const normalizeTransactionDate = (date) => {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T12:00:00`;
  }

  return date;
};

class ExpenseService {
  /**
   * Obtener gastos del usuario
   */
  async getUserExpenses(userId, filters = {}) {
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

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name type color'),
      Expense.countDocuments(query),
    ]);

    return {
      data: expenses.map(mapExpenseForResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Crear gasto
   */
  async createExpense(userId, expenseData) {
    const normalizedData = normalizeExpenseInput(expenseData);

    if (normalizedData.clientRequestId) {
      const existingExpense = await Expense.findOne({
        userId,
        clientRequestId: normalizedData.clientRequestId,
      }).populate('category', 'name type color');

      if (existingExpense) {
        return mapExpenseForResponse(existingExpense);
      }
    }

    const expense = await Expense.create({
      ...normalizedData,
      userId,
    });

    const populatedExpense = await Expense.findById(expense._id).populate(
      'category',
      'name type color'
    );

    return mapExpenseForResponse(populatedExpense);
  }

  /**
   * Actualizar gasto
   */
  async updateExpense(expenseId, userId, expenseData) {
    const normalizedData = normalizeExpenseInput(expenseData);

    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, userId },
      normalizedData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('category', 'name type color');

    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }

    return mapExpenseForResponse(expense);
  }

  /**
   * Obtener gasto por ID
   */
  async getExpenseById(expenseId, userId) {
    const expense = await Expense.findOne({
      _id: expenseId,
      userId,
    }).populate('category', 'name type color');

    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }

    return mapExpenseForResponse(expense);
  }

  /**
   * Eliminar gasto
   */
  async deleteExpense(expenseId, userId) {
    const expense = await Expense.findOneAndDelete({ _id: expenseId, userId });

    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }

    return {
      id: expense._id.toString(),
      concept: expense.description,
    };
  }
}

export default new ExpenseService();
