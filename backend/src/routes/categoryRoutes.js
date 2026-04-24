/**
 * Rutas de Categorías
 * Endpoints para gestionar categorías
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET - Listar categorías
// router.get('/', getCategories);

// POST - Crear categoría
// router.post('/', validateCategoryInput, createCategory);

// PUT - Actualizar categoría
// router.put('/:id', validateCategoryInput, updateCategory);

// DELETE - Eliminar categoría
// router.delete('/:id', deleteCategory);

export default router;
