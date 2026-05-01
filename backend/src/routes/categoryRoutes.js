/**
 * Rutas de Categorías
 * Endpoints para gestionar categorías
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.use(authenticate);

// GET - Listar categorías
router.get('/', getCategories);

// POST - Crear categoría
router.post('/', createCategory);

// PUT - Actualizar categoría
router.put('/:id', updateCategory);

// DELETE - Eliminar categoría
router.delete('/:id', deleteCategory);

export default router;
