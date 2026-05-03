/**
 * Servicio de Categorías
 * Lógica de negocio para categorías
 */

import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../errors/ApplicationError.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const DEFAULT_CATEGORIES = [
  { name: 'Alimentación', type: 'expense', color: '#ef4444', icon: '🍽️' },
  { name: 'Transporte', type: 'expense', color: '#f97316', icon: '🚌' },
  { name: 'Vivienda', type: 'expense', color: '#eab308', icon: '🏠' },
  { name: 'Salud', type: 'expense', color: '#22c55e', icon: '💊' },
  { name: 'Educación', type: 'expense', color: '#06b6d4', icon: '📚' },
  { name: 'Entretenimiento', type: 'expense', color: '#8b5cf6', icon: '🎮' },
  { name: 'Servicios', type: 'expense', color: '#64748b', icon: '🧾' },
  { name: 'Otros Gastos', type: 'expense', color: '#94a3b8', icon: '📌' },
  { name: 'Salario', type: 'income', color: '#10b981', icon: '💼' },
  { name: 'Freelance', type: 'income', color: '#14b8a6', icon: '🧑‍💻' },
  { name: 'Ventas', type: 'income', color: '#22c55e', icon: '🛍️' },
  { name: 'Inversiones', type: 'income', color: '#0ea5e9', icon: '📈' },
  { name: 'Otros Ingresos', type: 'income', color: '#a3e635', icon: '💰' },
];

const mapCategoryForResponse = (categoryDocument) => {
  const category = categoryDocument.toObject ? categoryDocument.toObject() : categoryDocument;

  return {
    ...category,
    id: category._id?.toString(),
  };
};

const normalizeType = (type) => String(type || '').trim().toLowerCase();

const validateType = (type) => {
  if (!['income', 'expense'].includes(type)) {
    throw new ValidationError('El tipo de categoría debe ser income o expense');
  }
};

const ensureUniqueNamePerType = async ({ userId, type, name, excludeId = null }) => {
  const normalizedName = String(name || '').trim();
  const duplicateQuery = {
    userId,
    type,
    name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' },
  };

  if (excludeId) {
    duplicateQuery._id = { $ne: excludeId };
  }

  const existingCategory = await Category.findOne(duplicateQuery);

  if (existingCategory) {
    throw new ConflictError('Ya existe una categoría con ese nombre y tipo');
  }
};

export const ensureDefaultCategoriesForUser = async (userId) => {
  await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      Category.updateOne(
        {
          userId,
          type: category.type,
          name: category.name,
        },
        {
          $setOnInsert: {
            userId,
            ...category,
            description: category.type === 'income'
              ? 'Categoría por defecto para ingresos'
              : 'Categoría por defecto para gastos',
          },
        },
        { upsert: true }
      )
    )
  );
};

class CategoryService {
  async getCategory(categoryId, userId) {
    const category = await Category.findOne({ _id: categoryId, userId });

    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    return mapCategoryForResponse(category);
  }

  async getUserCategories(userId, filters = {}) {
    await ensureDefaultCategoriesForUser(userId);

    const query = { userId };

    if (filters.type) {
      const normalizedType = normalizeType(filters.type);
      validateType(normalizedType);
      query.type = normalizedType;
    }

    const categories = await Category.find(query).sort({ type: 1, name: 1 });

    return categories.map(mapCategoryForResponse);
  }

  async createCategory(userId, categoryData) {
    const name = String(categoryData.name || '').trim();
    const type = normalizeType(categoryData.type);

    if (!name) {
      throw new ValidationError('El nombre de categoría es requerido');
    }

    validateType(type);

    await ensureUniqueNamePerType({ userId, type, name });

    const category = await Category.create({
      userId,
      name,
      type,
      color: categoryData.color,
      icon: categoryData.icon,
      description: categoryData.description,
    });

    return mapCategoryForResponse(category);
  }

  async updateCategory(categoryId, userId, categoryData) {
    const category = await Category.findOne({ _id: categoryId, userId });

    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    const nextName = categoryData.name ? String(categoryData.name).trim() : category.name;
    const nextType = categoryData.type ? normalizeType(categoryData.type) : category.type;

    if (!nextName) {
      throw new ValidationError('El nombre de categoría es requerido');
    }

    validateType(nextType);

    await ensureUniqueNamePerType({
      userId,
      type: nextType,
      name: nextName,
      excludeId: category._id,
    });

    category.name = nextName;
    category.type = nextType;

    if (categoryData.color !== undefined) {
      category.color = categoryData.color;
    }

    if (categoryData.icon !== undefined) {
      category.icon = categoryData.icon;
    }

    if (categoryData.description !== undefined) {
      category.description = categoryData.description;
    }

    await category.save();

    return mapCategoryForResponse(category);
  }

  async deleteCategory(categoryId, userId) {
    const category = await Category.findOne({ _id: categoryId, userId });

    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    const [expenseCount, incomeCount] = await Promise.all([
      Expense.countDocuments({ userId, category: categoryId }),
      Income.countDocuments({ userId, category: categoryId }),
    ]);

    if (expenseCount > 0 || incomeCount > 0) {
      throw new ConflictError('No puedes eliminar una categoría que ya tiene movimientos asociados');
    }

    await category.deleteOne();

    return {
      id: categoryId,
      name: category.name,
    };
  }
}

export default new CategoryService();
