/**
 * Controlador de Autenticación
 */

import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  res.status(201).json(successResponse({}, 'Usuario registrado'));
});

export const login = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Sesión iniciada'));
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Sesión cerrada'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({}, 'Token refrescado'));
});
