/**
 * Plantilla de Rutas
 * Ejemplo para crear nuevas rutas siguiendo la estructura MVC
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

// Aquí importaremos los controladores cuando estén listos
// import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

// Rutas protegidas por autenticación
router.use(authenticate);

// GET - Obtener todos los gastos
// router.get('/', getExpenses);

// POST - Crear un nuevo gasto
// router.post('/', createExpense);

// PUT - Actualizar un gasto
// router.put('/:id', updateExpense);

// DELETE - Eliminar un gasto
// router.delete('/:id', deleteExpense);

export default router;
