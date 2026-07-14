/**
 * Utilidades de Formateo
 * Funciones para formatear datos en el frontend
 */

import { toDateInputValue } from './dateUtils.js';

export const formatDate = (date, locale = 'es-MX') => {
  const dateOnly = toDateInputValue(date);

  if (!dateOnly) {
    return '';
  }

  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale);
};

export const getMonthName = (month) => {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return months[month - 1];
};
