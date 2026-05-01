/**
 * Controlador de Autenticación
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { AuthenticationError } from '../errors/ApplicationError.js';
import authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const payload = await authService.registerUser(req.body);

  res.status(201).json(
    successResponse(payload, 'Usuario registrado exitosamente', 201)
  );
});

export const login = asyncHandler(async (req, res) => {
  const payload = await authService.loginUser(req.body);

  res.status(200).json(
    successResponse(payload, 'Sesión iniciada exitosamente')
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(
    successResponse({}, 'Sesión cerrada exitosamente')
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('Se requiere un token para refrescar la sesión');
  }

  const payload = await authService.refreshUserToken(token);

  res.status(200).json(
    successResponse(payload, 'Token refrescado exitosamente')
  );
});
