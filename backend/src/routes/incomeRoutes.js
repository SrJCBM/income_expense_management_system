/**
 * Rutas de Ingresos
 * Endpoints para gestionar ingresos
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET - Obtener todos los ingresos
// router.get('/', getIncomes);

// POST - Crear ingreso
// router.post('/', validateIncomeInput, createIncome);

// PUT - Actualizar ingreso
// router.put('/:id', validateIncomeInput, updateIncome);

// DELETE - Eliminar ingreso
// router.delete('/:id', deleteIncome);

export default router;
