/**
 * Rutas de Presupuestos
 * Endpoints para gestionar presupuestos
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
} from '../controllers/budgetController.js';
import { validateBudgetInput } from '../validators/budgetValidator.js';
import { handleValidationErrors } from '../validators/authValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getBudgets);
router.get('/alerts', getBudgetAlerts);
router.post('/', validateBudgetInput, handleValidationErrors, createBudget);
router.put('/:id', validateBudgetInput, handleValidationErrors, updateBudget);
router.delete('/:id', deleteBudget);

export default router;
