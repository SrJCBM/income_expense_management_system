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
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'Sin ingresos registrados',
        };
      }

      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para obtener ingresos.');
      }

      throw new Error(error.response?.data?.message || 'No se pudieron obtener los ingresos.');
    }
  }

  async createIncome(incomeData) {
    try {
      const response = await api.post(API_ENDPOINTS.INCOMES.CREATE, incomeData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para crear el ingreso.');
      }

      throw new Error(error.response?.data?.message || 'No se pudo crear el ingreso.');
    }
  }

  async updateIncome(id, incomeData) {
    try {
      const response = await api.put(API_ENDPOINTS.INCOMES.UPDATE(id), incomeData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para actualizar el ingreso.');
      }

      throw new Error(error.response?.data?.message || 'No se pudo actualizar el ingreso.');
    }
  }

  async deleteIncome(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.INCOMES.DELETE(id));
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para eliminar el ingreso.');
      }

      throw new Error(error.response?.data?.message || 'No se pudo eliminar el ingreso.');
    }
  }
}

export default new IncomeService();
