/**
 * Validadores del Backend
 * Reglas de validación para datos de entrada
 */

import { body, validationResult } from 'express-validator';

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
