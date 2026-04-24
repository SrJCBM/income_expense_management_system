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
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
  }

  async deleteCategory(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
      return response.data;
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }
}

export default new CategoryService();
