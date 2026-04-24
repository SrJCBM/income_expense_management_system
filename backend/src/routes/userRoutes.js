/**
 * Rutas de Usuarios
 * Endpoints para gestionar usuarios
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET - Obtener perfil del usuario
// router.get('/profile', getProfile);

// PUT - Actualizar perfil
// router.put('/profile/update', updateProfile);

// DELETE - Eliminar cuenta
// router.delete('/profile/delete', deleteAccount);

export default router;
