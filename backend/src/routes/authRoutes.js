/**
 * Rutas de Autenticación
 * Endpoints para login, register y refresh
 */

import express from 'express';
import {
	register,
	login,
	logout,
	refreshToken,
	getProfile,
} from '../controllers/authController.js';
import {
	validateRegisterInput,
	validateLoginInput,
	handleValidationErrors,
} from '../validators/authValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST - Registrar usuario
router.post('/register', validateRegisterInput, handleValidationErrors, register);

// POST - Iniciar sesión
router.post('/login', validateLoginInput, handleValidationErrors, login);

// GET - Obtener perfil del usuario autenticado
router.get('/me', authenticate, getProfile);

// POST - Cerrar sesión
router.post('/logout', logout);

// POST - Refrescar token
router.post('/refresh', refreshToken);

export default router;
