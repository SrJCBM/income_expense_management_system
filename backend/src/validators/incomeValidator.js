/**
 * Validadores para Ingresos
 */

import { body, validationResult } from 'express-validator';

/**
 * Middleware que normaliza aliases ANTES de validar.
 * Convierte "concept" → "description" y "categoryId" → "category"
 * para que los validadores trabajen con campos canónicos.
 */
export const normalizeIncomeAliases = (req, res, next) => {
  if (!req.body.description && req.body.concept) {
    req.body.description = req.body.concept;
  }
  if (!req.body.category && req.body.categoryId) {
    req.body.category = req.body.categoryId;
  }
  next();
};

export const validateIncomeInput = [
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no debe exceder 500 caracteres'),

  body('amount')
    .notEmpty()
    .withMessage('El monto es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo'),

  body('category')
    .notEmpty()
    .withMessage('La categoría es requerida')
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