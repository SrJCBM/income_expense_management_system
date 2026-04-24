/**
 * Servicio de Ingresos para Frontend
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

class IncomeService {
  async getIncomes(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.INCOMES.LIST, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener ingresos: ${error.message}`);
    }
  }

  async createIncome(incomeData) {
    try {
      const response = await api.post(API_ENDPOINTS.INCOMES.CREATE, incomeData);
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear ingreso: ${error.message}`);
    }
  }

  async updateIncome(id, incomeData) {
    try {
      const response = await api.put(API_ENDPOINTS.INCOMES.UPDATE(id), incomeData);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar ingreso: ${error.message}`);
    }
  }

  async deleteIncome(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.INCOMES.DELETE(id));
      return response.data;
    } catch (error) {
      throw new Error(`Error al eliminar ingreso: ${error.message}`);
    }
  }
}

export default new IncomeService();
