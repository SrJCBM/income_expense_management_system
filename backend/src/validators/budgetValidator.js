/**
 * Validadores de Presupuestos
 */

import { body } from 'express-validator';

export const validateBudgetInput = [
  body('limitAmount')
    .notEmpty()
    .withMessage('El monto límite es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El monto límite debe ser mayor a 0'),
  body('month')
    .notEmpty()
    .withMessage('El mes es requerido')
    .isInt({ min: 1, max: 12 })
    .withMessage('El mes debe estar entre 1 y 12'),
  body('year')
    .notEmpty()
    .withMessage('El año es requerido')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Año no válido'),
  body('alertThreshold')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('El umbral de alerta debe estar entre 0 y 100'),
  body()
    .custom((value) => Boolean(value.category || value.categoryId))
    .withMessage('La categoría es requerida'),
];
