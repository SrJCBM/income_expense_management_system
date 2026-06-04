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
  };

  if (Array.isArray(expenseData.tags)) {
    normalized.tags = expenseData.tags;
  }

  return normalized;
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

    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .populate('category', 'name type color');

    return expenses.map(mapExpenseForResponse);
  }

  /**
   * Crear gasto
   */
  async createExpense(userId, expenseData) {
    const normalizedData = normalizeExpenseInput(expenseData);

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
