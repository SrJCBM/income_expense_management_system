/**
 * Servicio de Gastos
 * Model - Capa de lógica de negocio para gastos
 * Maneja todas las operaciones relacionadas con gastos
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

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
      throw new Error(`Error al obtener gastos: ${error.message}`);
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
      throw new Error(`Error al crear gasto: ${error.message}`);
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
      throw new Error(`Error al actualizar gasto: ${error.message}`);
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
      throw new Error(`Error al eliminar gasto: ${error.message}`);
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
      throw new Error(`Error al obtener gastos por categoría: ${error.message}`);
    }
  }
}

export default new ExpenseService();
