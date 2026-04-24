/**
 * Plantilla de Controlador - Categorías
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse([], 'Categorías obtenidas'));
});

export const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(successResponse({}, 'Categoría creada'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Categoría actualizada'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Categoría eliminada'));
});
