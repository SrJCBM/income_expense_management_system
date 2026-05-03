import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createIncome,
  deleteIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
} from '../controllers/incomeController.js';
import {
  validateIncomeInput,
  handleValidationErrors,
  normalizeIncomeAliases,
} from '../validators/incomeValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getIncomes);
router.get('/:id', getIncomeById);
router.post('/', normalizeIncomeAliases, validateIncomeInput, handleValidationErrors, createIncome);
router.put('/:id', normalizeIncomeAliases, validateIncomeInput, handleValidationErrors, updateIncome);
router.delete('/:id', deleteIncome);

export default router;
