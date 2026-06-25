/**
 * Controlador de Presupuestos
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import budgetService from '../services/budgetService.js';

export const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getUserBudgets(req.user.userId, req.query);

  res.status(200).json(successResponse(budgets, 'Presupuestos obtenidos'));
});

export const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.user.userId, req.body);

  res.status(201).json(successResponse(budget, 'Presupuesto creado exitosamente', 201));
});

export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.user.userId, req.body);

  res.status(200).json(successResponse(budget, 'Presupuesto actualizado exitosamente'));
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const deleted = await budgetService.deleteBudget(req.params.id, req.user.userId);

  res.status(200).json(successResponse(deleted, 'Presupuesto eliminado exitosamente'));
});

export const getBudgetAlerts = asyncHandler(async (req, res) => {
  const alerts = await budgetService.getBudgetAlerts(req.user.userId);

  res.status(200).json(successResponse(alerts, 'Alertas de presupuesto obtenidas'));
});
