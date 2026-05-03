/**
 * Validadores de Autenticación
 */

import { body, validationResult } from 'express-validator';

/**
 * Validar formato de email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validar contraseña
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  // Mínimo 8 caracteres
  return password.length >= 8;
};

export const validateRegisterInput = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .normalizeEmail()
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
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email no válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
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
