/**
 * Controladores de Ingresos
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const getIncomes = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse([], 'Ingresos obtenidos'));
});

export const createIncome = asyncHandler(async (req, res) => {
  res.status(201).json(successResponse({}, 'Ingreso creado'));
});

export const updateIncome = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Ingreso actualizado'));
});

export const deleteIncome = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Ingreso eliminado'));
});
