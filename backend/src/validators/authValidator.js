/**
 * Validadores de autenticacion.
 */

import { body, validationResult } from 'express-validator';

/**
 * Validar formato de email.
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validar contrasena.
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }

  return password.length >= 8;
};

export const validateRegisterInput = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email no valido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contrasena debe tener al menos 8 caracteres'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .matches(/[A-Za-z]/)
    .withMessage('El nombre debe incluir al menos una letra'),
];

export const validateLoginInput = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email no valido'),
  body('password')
    .notEmpty()
    .withMessage('La contrasena es requerida'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validacion',
      errors: errors.array(),
    });
  }

  next();
};
