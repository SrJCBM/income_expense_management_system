/**
 * Endpoints de la API
 * Centraliza todas las rutas para facilitar mantenimiento
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh`,
  },

  // Users
  USERS: {
    PROFILE: `${BASE_URL}/users/profile`,
    UPDATE: `${BASE_URL}/users/profile/update`,
    DELETE: `${BASE_URL}/users/profile/delete`,
  },

  // Expenses
  EXPENSES: {
    LIST: `${BASE_URL}/expenses`,
    CREATE: `${BASE_URL}/expenses`,
    UPDATE: (id) => `${BASE_URL}/expenses/${id}`,
    DELETE: (id) => `${BASE_URL}/expenses/${id}`,
    GET_BY_CATEGORY: (categoryId) => `${BASE_URL}/expenses/category/${categoryId}`,
  },

  // Incomes
  INCOMES: {
    LIST: `${BASE_URL}/incomes`,
    CREATE: `${BASE_URL}/incomes`,
    UPDATE: (id) => `${BASE_URL}/incomes/${id}`,
    DELETE: (id) => `${BASE_URL}/incomes/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: `${BASE_URL}/categories`,
    CREATE: `${BASE_URL}/categories`,
    UPDATE: (id) => `${BASE_URL}/categories/${id}`,
    DELETE: (id) => `${BASE_URL}/categories/${id}`,
  },

  // Budgets
  BUDGETS: {
    LIST: `${BASE_URL}/budgets`,
    CREATE: `${BASE_URL}/budgets`,
    UPDATE: (id) => `${BASE_URL}/budgets/${id}`,
    DELETE: (id) => `${BASE_URL}/budgets/${id}`,
  },

  // Reports
  REPORTS: {
    FILTERS: `${BASE_URL}/reports/filters`,
    SUMMARY: `${BASE_URL}/reports/summary`,
    MONTHLY: `${BASE_URL}/reports/monthly`,
    YEARLY: `${BASE_URL}/reports/yearly`,
    CATEGORY_BREAKDOWN: `${BASE_URL}/reports/category-breakdown`,
  },
};
