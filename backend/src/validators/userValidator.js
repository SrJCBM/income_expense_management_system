/**
 * Validadores de Usuario
 * Reglas de validación para el perfil del usuario
 */

import { body } from 'express-validator';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'MXN', 'PEN', 'COP', 'ARS', 'CLP'];

export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('El nombre debe tener entre 2 y 120 caracteres')
    .matches(/[A-Za-zÀ-ÿ]/)
    .withMessage('El nombre debe incluir al menos una letra'),
  body('currency')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(SUPPORTED_CURRENCIES)
    .withMessage('Moneda no soportada'),
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
];
