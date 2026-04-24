/**
 * Rutas de Presupuestos
 * Endpoints para gestionar presupuestos
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET - Listar presupuestos
// router.get('/', getBudgets);

// POST - Crear presupuesto
// router.post('/', validateBudgetInput, createBudget);

// PUT - Actualizar presupuesto
// router.put('/:id', validateBudgetInput, updateBudget);

// DELETE - Eliminar presupuesto
// router.delete('/:id', deleteBudget);

export default router;
