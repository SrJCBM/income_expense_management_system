/**
 * Validadores de Autenticación
 */

import { body } from 'express-validator';

export const validateRegisterInput = [
  body('email')
    .isEmail()
    .withMessage('Email no válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
];

export const validateLoginInput = [
  body('email')
    .isEmail()
    .withMessage('Email no válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];
