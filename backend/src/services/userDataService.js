import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import { ensureDefaultCategoriesForUser } from './categoryService.js';
import { ApplicationError } from '../errors/ApplicationError.js';

export const resetAllUserData = async (userId) => {
  await Promise.all([
    Expense.deleteMany({ userId }),
    Income.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Category.deleteMany({ userId }),
  ]);

  try {
    await ensureDefaultCategoriesForUser(userId);
  } catch {
    throw new ApplicationError(
      'Tus datos fueron eliminados, pero no se pudieron restaurar las categorías base. ' +
      'Ve a Categorías y créalas manualmente.',
      500
    );
  }
};
