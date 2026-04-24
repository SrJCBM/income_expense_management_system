/**
 * Constantes de la Aplicación
 * Valores que se reutilizan en todo el backend
 */

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Recurso no encontrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso prohibido',
  INVALID_INPUT: 'Entrada inválida',
  INTERNAL_ERROR: 'Error interno del servidor',
};

export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Otros',
];

export const INCOME_CATEGORIES = [
  'Salario',
  'Ventas',
  'Inversiones',
  'Otros',
];

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};
