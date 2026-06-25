/**
 * Servicio de Presupuestos
 * Lógica de negocio para presupuestos mensuales por categoría
 */

import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { ConflictError, NotFoundError } from '../errors/ApplicationError.js';

const mapBudgetForResponse = (budgetDocument, spentByCategory = new Map()) => {
  const budget = budgetDocument.toObject ? budgetDocument.toObject() : budgetDocument;
  const categoryData = budget.category && typeof budget.category === 'object'
    ? budget.category
    : null;
  const categoryId = categoryData?._id?.toString() || budget.category?.toString() || null;
  const spentAmount = spentByCategory.get(categoryId) || 0;
  const limitAmount = Number(budget.limitAmount) || 0;
  const percentageUsed = limitAmount > 0 ? Math.round((spentAmount / limitAmount) * 100) : 0;

  return {
    ...budget,
    id: budget._id?.toString(),
    categoryId,
    category: categoryData
      ? {
          _id: categoryData._id,
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
        }
      : budget.category,
    spentAmount,
    remainingAmount: Math.max(limitAmount - spentAmount, 0),
    percentageUsed,
    isOverBudget: spentAmount > limitAmount,
    isNearLimit: percentageUsed >= (budget.alertThreshold ?? 80) && spentAmount <= limitAmount,
  };
};

const getSpentByCategory = async (userId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const totals = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(String(userId)),
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ]);

  return new Map(totals.map((item) => [item._id?.toString(), item.total]));
};

const normalizeBudgetInput = (budgetData) => ({
  category: budgetData.category || budgetData.categoryId,
  limitAmount: Number(budgetData.limitAmount),
  month: Number(budgetData.month),
  year: Number(budgetData.year),
  ...(budgetData.alertThreshold !== undefined && {
    alertThreshold: Number(budgetData.alertThreshold),
  }),
});

class BudgetService {
  /**
   * Obtener presupuestos del usuario con su progreso de gasto
   */
  async getUserBudgets(userId, filters = {}) {
    const now = new Date();
    const month = Number(filters.month) || now.getMonth() + 1;
    const year = Number(filters.year) || now.getFullYear();

    const [budgets, spentByCategory] = await Promise.all([
      Budget.find({ userId, month, year })
        .sort({ createdAt: -1 })
        .populate('category', 'name type color'),
      getSpentByCategory(userId, month, year),
    ]);

    return budgets.map((budget) => mapBudgetForResponse(budget, spentByCategory));
  }

  /**
   * Crear presupuesto (uno por categoría/mes/año)
   */
  async createBudget(userId, budgetData) {
    const normalizedData = normalizeBudgetInput(budgetData);

    const existing = await Budget.findOne({
      userId,
      category: normalizedData.category,
      month: normalizedData.month,
      year: normalizedData.year,
    });

    if (existing) {
      throw new ConflictError('Ya existe un presupuesto para esta categoría en este mes');
    }

    const budget = await Budget.create({ ...normalizedData, userId });
    const populatedBudget = await Budget.findById(budget._id).populate(
      'category',
      'name type color'
    );
    const spentByCategory = await getSpentByCategory(
      userId,
      normalizedData.month,
      normalizedData.year
    );

    return mapBudgetForResponse(populatedBudget, spentByCategory);
  }

  /**
   * Actualizar presupuesto
   */
  async updateBudget(budgetId, userId, budgetData) {
    const normalizedData = normalizeBudgetInput(budgetData);

    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, userId },
      normalizedData,
      { new: true, runValidators: true }
    ).populate('category', 'name type color');

    if (!budget) {
      throw new NotFoundError('Presupuesto no encontrado');
    }

    const spentByCategory = await getSpentByCategory(userId, budget.month, budget.year);

    return mapBudgetForResponse(budget, spentByCategory);
  }

  /**
   * Eliminar presupuesto
   */
  async deleteBudget(budgetId, userId) {
    const budget = await Budget.findOneAndDelete({ _id: budgetId, userId });

    if (!budget) {
      throw new NotFoundError('Presupuesto no encontrado');
    }

    return { id: budget._id.toString() };
  }

  /**
   * Resumen de alertas: presupuestos cerca del límite o excedidos del mes actual
   */
  async getBudgetAlerts(userId) {
    const budgets = await this.getUserBudgets(userId, {});

    return budgets.filter((budget) => budget.isOverBudget || budget.isNearLimit);
  }
}

export default new BudgetService();
