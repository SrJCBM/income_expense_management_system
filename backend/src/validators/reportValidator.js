/**
 * Validadores de Reportes
 * Reglas para los parámetros de rango de fechas
 */

import { query } from 'express-validator';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Verifica formato YYYY-MM-DD y que la fecha exista (p. ej. rechaza 2026-02-31)
const isValidDateParam = (value) => {
  if (!DATE_RE.test(value)) {
    return false;
  }
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

export const validateReportRange = [
  query('startDate')
    .optional()
    .custom((value) => {
      if (!isValidDateParam(value)) {
        throw new Error('startDate debe tener formato YYYY-MM-DD y ser una fecha válida');
      }
      return true;
    }),

  query('endDate')
    .optional()
    .custom((value) => {
      if (!isValidDateParam(value)) {
        throw new Error('endDate debe tener formato YYYY-MM-DD y ser una fecha válida');
      }
      return true;
    }),

  query().custom((_, { req }) => {
    const { startDate, endDate } = req.query;
    if ((startDate && !endDate) || (!startDate && endDate)) {
      throw new Error('startDate y endDate deben enviarse juntos');
    }
    if (
      startDate &&
      endDate &&
      isValidDateParam(startDate) &&
      isValidDateParam(endDate) &&
      startDate > endDate
    ) {
      throw new Error('startDate debe ser anterior o igual a endDate');
    }
    return true;
  }),
];
