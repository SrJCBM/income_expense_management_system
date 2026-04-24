/**
 * Controladores de Reportes
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const getSummary = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Resumen obtenido'));
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Reporte mensual obtenido'));
});

export const getYearlyReport = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Reporte anual obtenido'));
});

export const getCategoryBreakdown = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Desglose por categoría obtenido'));
});
