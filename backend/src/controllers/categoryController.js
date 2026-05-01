/**
 * Plantilla de Controlador - Categorías
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import categoryService from '../services/categoryService.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getUserCategories(req.user.userId, {
    type: req.query.type,
  });

  res.status(200).json(successResponse(categories, 'Categorías obtenidas'));
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.user.userId, req.body);

  res.status(201).json(successResponse(category, 'Categoría creada'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.user.userId,
    req.body
  );

  res.status(200).json(successResponse(category, 'Categoría actualizada'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const deletedCategory = await categoryService.deleteCategory(req.params.id, req.user.userId);

  res.status(200).json(successResponse(deletedCategory, 'Categoría eliminada'));
});
