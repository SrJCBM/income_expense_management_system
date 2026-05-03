/**
 * Controlador de Ingresos
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import incomeService from '../services/incomeService.js';

export const getIncomes = asyncHandler(async (req, res) => {
  const incomes = await incomeService.getUserIncomes(req.user.userId, {
    month: req.query.month,
    year: req.query.year,
    category: req.query.category,
  });

  res.status(200).json(successResponse(incomes, 'Ingresos obtenidos'));
});

// ← NUEVO: faltaba este endpoint, los tests GET /:id lo necesitan
export const getIncomeById = asyncHandler(async (req, res) => {
  const income = await incomeService.getIncomeById(req.params.id, req.user.userId);

  res.status(200).json(successResponse(income, 'Ingreso obtenido'));
});

export const createIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.createIncome(req.user.userId, req.body);

  res.status(201).json(successResponse(income, 'Ingreso creado'));
});

export const updateIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.updateIncome(
    req.params.id,
    req.user.userId,
    req.body
  );

  res.status(200).json(successResponse(income, 'Ingreso actualizado'));
});

export const deleteIncome = asyncHandler(async (req, res) => {
  const deletedIncome = await incomeService.deleteIncome(req.params.id, req.user.userId);

  res.status(200).json(successResponse(deletedIncome, 'Ingreso eliminado'));
});