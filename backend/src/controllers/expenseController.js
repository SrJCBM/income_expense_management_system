/**
 * Plantilla de Controlador
 * Estructura base para controladores siguiendo Clean Code
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import expenseService from '../services/expenseService.js';

/**
 * Obtener todos los gastos
 * @param {Object} req - Request del usuario
 * @param {Object} res - Response del servidor
 */
export const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getUserExpenses(req.user.userId, req.query);

  res.status(200).json(successResponse(expenses, 'Gastos obtenidos'));
});

/**
 * Crear un nuevo gasto
 */
export const createExpense = asyncHandler(async (req, res) => {
  const createdExpense = await expenseService.createExpense(req.user.userId, req.body);

  res.status(201).json(successResponse(createdExpense, 'Gasto creado exitosamente', 201));
});

/**
 * Actualizar un gasto
 */
export const updateExpense = asyncHandler(async (req, res) => {
  const updatedExpense = await expenseService.updateExpense(
    req.params.id,
    req.user.userId,
    req.body
  );

  res.status(200).json(successResponse(updatedExpense, 'Gasto actualizado exitosamente'));
});

/**
 * Eliminar un gasto
 */
export const deleteExpense = asyncHandler(async (req, res) => {
  const deletedExpense = await expenseService.deleteExpense(req.params.id, req.user.userId);

  res.status(200).json(successResponse(deletedExpense, 'Gasto eliminado exitosamente'));
});
