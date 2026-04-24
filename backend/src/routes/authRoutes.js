/**
 * Rutas de Autenticación
 * Endpoints para login, register y refresh
 */

import express from 'express';
// import { register, login, logout, refreshToken } from '../controllers/authController.js';
// import { validateRegisterInput, validateLoginInput, handleValidationErrors } from '../validators/authValidator.js';

const router = express.Router();

// POST - Registrar usuario
// router.post('/register', validateRegisterInput, handleValidationErrors, register);

// POST - Iniciar sesión
// router.post('/login', validateLoginInput, handleValidationErrors, login);

// POST - Cerrar sesión
// router.post('/logout', logout);

// POST - Refrescar token
// router.post('/refresh', refreshToken);

export default router;
