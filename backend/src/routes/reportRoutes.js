/**
 * Rutas de Reportes
 * Endpoints para obtener reportes y análisis
 */

import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
	getCategoryBreakdown,
	getReportFilters,
	getMonthlyReport,
	getSummary,
	getYearlyReport,
} from '../controllers/reportController.js';

const router = express.Router();

router.use(authenticate);

// GET - Filtros dinámicos por datos existentes
router.get('/filters', getReportFilters);

// GET - Resumen general
router.get('/summary', getSummary);

// GET - Reporte mensual
router.get('/monthly', getMonthlyReport);

// GET - Reporte anual
router.get('/yearly', getYearlyReport);

// GET - Desglose por categoría
router.get('/category-breakdown', getCategoryBreakdown);

export default router;
