/**
 * Servicio de Categorías para Frontend
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

class CategoryService {
  async getCategories(type = '') {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST, {
        params: type ? { type } : {},
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'Sin categorías registradas',
        };
      }

      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para obtener categorías.');
      }

      throw new Error(error.response?.data?.message || 'No se pudieron obtener las categorías.');
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para crear la categoría.');
      }

      throw new Error(error.response?.data?.message || 'No se pudo crear la categoría.');
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), categoryData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para actualizar la categoría.');
      }

      throw new Error(error.response?.data?.message || 'No se pudo actualizar la categoría.');
    }
  }

  async deleteCategory(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor para eliminar la categoría.');
      }

      throw new Error(error.response?.data?.message || 'No se pudo eliminar la categoría.');
    }
  }
}

export default new CategoryService();
