/**
 * Validadores del Backend
 * Reglas de validación para datos de entrada
 */

import { body, validationResult } from 'express-validator';

/**
 * Validar monto/cantidad
 */
export const validateAmount = (amount) => {
  if (amount === null || amount === undefined) {
    return false;
  }
  const num = parseFloat(amount);
  // Rechazar NaN, Infinity, y valores iguales a 0
  if (isNaN(num) || !isFinite(num) || num <= 0) {
    return false;
  }
  // Si es string, verificar que sea totalmente numérico
  if (typeof amount === 'string') {
    return /^\d+(\.\d+)?$/.test(amount.trim());
  }
  return true;
};

/**
 * Validar formato de fecha
 */
export const validateDate = (date) => {
  if (!date || typeof date !== 'string') {
    return false;
  }
  // Verificar formato ISO8601
  const isoRegex = /^\d{4}-\d{2}-\d{2}T?\d{0,2}:?\d{0,2}:?\d{0,2}Z?$/;
  if (!isoRegex.test(date)) {
    return false;
  }
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

/**
 * Validar categoría
 */
export const validateCategory = (category, validCategories) => {
  if (!category || typeof category !== 'string') {
    return false;
  }
  if (!Array.isArray(validCategories)) {
    return false;
  }
  return validCategories.includes(category);
};

export const validateExpenseInput = [
  body().custom((_, { req }) => {
    if (!req.body.description && !req.body.concept) {
      throw new Error('La descripción es requerida');
    }
    return true;
  }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no debe exceder 500 caracteres'),

  body('concept')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El concepto no debe exceder 500 caracteres'),

  body('amount')
    .notEmpty()
    .withMessage('El monto es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo'),

  body().custom((_, { req }) => {
    if (!req.body.category && !req.body.categoryId) {
      throw new Error('La categoría es requerida');
    }
    return true;
  }),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('ID de categoría inválido'),

  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('ID de categoría inválido'),

  body('date')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no deben exceder 1000 caracteres'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array(),
    });
  }
  next();
};
