/**
 * Servicio de Ingresos
 * Contiene la lógica de negocio para ingresos
 */

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
  date: incomeData.date,
  notes: incomeData.notes,
});

const ensureValidIncomeCategory = async (userId, categoryId) => {
  if (!categoryId) {
    return;
  }

  const category = await Category.findOne({
    _id: categoryId,
    userId,
    type: 'income',
  });

  if (!category) {
    throw new ValidationError('La categoría seleccionada no es válida para ingresos');
  }
};

class IncomeService {
  /**
   * Obtener ingresos del usuario con filtros opcionales
   */
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

  /**
   * Crear nuevo ingreso
   */
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

  /**
   * Actualizar ingreso
   */
  async updateIncome(incomeId, userId, incomeData) {
    const normalizedData = normalizeIncomeInput(incomeData);

    if (normalizedData.category) {
      await ensureValidIncomeCategory(userId, normalizedData.category);
    }

    const income = await Income.findOneAndUpdate(
      { _id: incomeId, userId },
      normalizedData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('category', 'name type color');

    if (!income) {
      throw new NotFoundError('Ingreso no encontrado');
    }

    return mapIncomeForResponse(income);
  }

  /**
   * Eliminar ingreso
   */
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
