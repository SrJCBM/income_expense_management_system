/**
 * Controlador de Usuarios
 * Gestión del perfil del usuario autenticado
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import authService from '../services/authService.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import { ensureDefaultCategoriesForUser } from '../services/categoryService.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user.userId);

  res.status(200).json(successResponse(profile, 'Perfil obtenido exitosamente'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await authService.updateUserProfile(req.user.userId, req.body);

  res.status(200).json(successResponse(profile, 'Perfil actualizado exitosamente'));
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changeUserPassword(req.user.userId, req.body);

  res.status(200).json(successResponse({}, 'Contraseña actualizada exitosamente'));
});

export const resetUserData = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  await Promise.all([
    Expense.deleteMany({ userId }),
    Income.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Category.deleteMany({ userId }),
  ]);

  await ensureDefaultCategoriesForUser(userId);

  res.status(200).json(successResponse({}, 'Datos eliminados. Categorías base restauradas.'));
});
