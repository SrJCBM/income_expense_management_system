/**
 * Plantilla de Controlador
 * Uso de ejemplo para Income
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Obtener todos los ingresos del usuario
 */
export const getIncomes = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(200).json(successResponse([], 'Ingresos obtenidos'));
});

/**
 * Crear nuevo ingreso
 */
export const createIncome = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(201).json(successResponse({}, 'Ingreso creado'));
});

/**
 * Actualizar ingreso
 */
export const updateIncome = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(200).json(successResponse({}, 'Ingreso actualizado'));
});

/**
 * Eliminar ingreso
 */
export const deleteIncome = asyncHandler(async (req, res) => {
  // Lógica aquí
  res.status(200).json(successResponse({}, 'Ingreso eliminado'));
});
