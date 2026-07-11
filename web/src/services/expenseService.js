/**
 * Servicio de Gastos
 * Model - Capa de lógica de negocio para gastos
 * Maneja todas las operaciones relacionadas con gastos
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

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

const buildNetworkError = () => new Error('No se pudo conectar con el servidor para gestionar gastos.');

class ExpenseService {
  /**
   * Obtener todos los gastos
   */
  async getExpenses(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.EXPENSES.LIST, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw buildNetworkError();
      }

      throw new Error(error.response?.data?.message || `Error al obtener gastos: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo gasto
   */
  async createExpense(expenseData) {
    try {
      const response = await api.post(API_ENDPOINTS.EXPENSES.CREATE, expenseData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw buildNetworkError();
      }

      if (error.response?.data?.errors) {
        throw { validationErrors: mapBackendValidationErrors(error.response.data.errors) };
      }

      throw new Error(error.response?.data?.message || `Error al crear gasto: ${error.message}`);
    }
  }

  /**
   * Actualizar un gasto
   */
  async updateExpense(id, expenseData) {
    try {
      const response = await api.put(API_ENDPOINTS.EXPENSES.UPDATE(id), expenseData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw buildNetworkError();
      }

      if (error.response?.data?.errors) {
        throw { validationErrors: mapBackendValidationErrors(error.response.data.errors) };
      }

      throw new Error(error.response?.data?.message || `Error al actualizar gasto: ${error.message}`);
    }
  }

  /**
   * Eliminar un gasto
   */
  async deleteExpense(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.EXPENSES.DELETE(id));
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw buildNetworkError();
      }

      throw new Error(error.response?.data?.message || `Error al eliminar gasto: ${error.message}`);
    }
  }

  /**
   * Obtener gastos por categoría
   */
  async getExpensesByCategory(categoryId) {
    try {
      const response = await api.get(API_ENDPOINTS.EXPENSES.GET_BY_CATEGORY(categoryId));
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw buildNetworkError();
      }

      throw new Error(error.response?.data?.message || `Error al obtener gastos por categoría: ${error.message}`);
    }
  }
}

export default new ExpenseService();
