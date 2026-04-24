/**
 * Plantilla de Controlador
 * Estructura base para controladores siguiendo Clean Code
 */

import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

// Aquí importaremos los modelos cuando estén listos
// import ExpenseModel from '../models/ExpenseModel.js';

/**
 * Obtener todos los gastos
 * @param {Object} req - Request del usuario
 * @param {Object} res - Response del servidor
 */
export const getExpenses = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(200).json(successResponse([], 'Gastos obtenidos'));
});

/**
 * Crear un nuevo gasto
 */
export const createExpense = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(201).json(successResponse({}, 'Gasto creado'));
});

/**
 * Actualizar un gasto
 */
export const updateExpense = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(200).json(successResponse({}, 'Gasto actualizado'));
});

/**
 * Eliminar un gasto
 */
export const deleteExpense = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(200).json(successResponse({}, 'Gasto eliminado'));
});
