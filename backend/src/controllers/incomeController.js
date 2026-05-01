/**
 * Plantilla de Controlador
 * Uso de ejemplo para Income
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import incomeService from '../services/incomeService.js';

/**
 * Obtener todos los ingresos del usuario
 */
export const getIncomes = asyncHandler(async (req, res) => {
  const incomes = await incomeService.getUserIncomes(req.user.userId, {
    month: req.query.month,
    year: req.query.year,
    category: req.query.category,
  });

  res.status(200).json(successResponse(incomes, 'Ingresos obtenidos'));
});

/**
 * Crear nuevo ingreso
 */
export const createIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.createIncome(req.user.userId, req.body);

  res.status(201).json(successResponse(income, 'Ingreso creado'));
});

/**
 * Actualizar ingreso
 */
export const updateIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.updateIncome(
    req.params.id,
    req.user.userId,
    req.body
  );

  res.status(200).json(successResponse(income, 'Ingreso actualizado'));
});

/**
 * Eliminar ingreso
 */
export const deleteIncome = asyncHandler(async (req, res) => {
  const deletedIncome = await incomeService.deleteIncome(req.params.id, req.user.userId);

  res.status(200).json(successResponse(deletedIncome, 'Ingreso eliminado'));
});
