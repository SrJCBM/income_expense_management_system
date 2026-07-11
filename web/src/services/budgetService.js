/**
 * Servicio de Presupuestos
 * Operaciones CRUD de presupuestos mensuales
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

const buildNetworkError = () =>
  new Error('No se pudo conectar con el servidor para gestionar presupuestos.');

const mapBackendValidationErrors = (errors = []) => {
  const mappedErrors = {};

  for (const error of errors) {
    const field = error.path || error.param || 'general';
    if (!mappedErrors[field]) {
      mappedErrors[field] = error.msg || 'Valor inválido';
    }
  }

  return mappedErrors;
};

const handleRequestError = (error, fallbackMessage) => {
  if (!error.response) {
    throw buildNetworkError();
  }

  if (error.response?.data?.errors) {
    throw { validationErrors: mapBackendValidationErrors(error.response.data.errors) };
  }

  throw new Error(error.response?.data?.message || fallbackMessage);
};

class BudgetService {
  async getBudgets(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGETS.LIST, { params: filters });
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al obtener presupuestos');
    }
  }

  async getAlerts() {
    try {
      const response = await api.get(API_ENDPOINTS.BUDGETS.ALERTS);
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al obtener alertas de presupuesto');
    }
  }

  async createBudget(budgetData) {
    try {
      const response = await api.post(API_ENDPOINTS.BUDGETS.CREATE, budgetData);
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al crear presupuesto');
    }
  }

  async updateBudget(id, budgetData) {
    try {
      const response = await api.put(API_ENDPOINTS.BUDGETS.UPDATE(id), budgetData);
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al actualizar presupuesto');
    }
  }

  async deleteBudget(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.BUDGETS.DELETE(id));
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al eliminar presupuesto');
    }
  }
}

export default new BudgetService();
