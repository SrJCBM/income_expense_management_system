/**
 * Rutas de Usuarios
 * Endpoints para gestionar el perfil del usuario
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { validateProfileUpdate, validatePasswordChange } from '../validators/userValidator.js';
import { handleValidationErrors } from '../validators/authValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/profile/password', validatePasswordChange, handleValidationErrors, changePassword);

export default router;
