/**
 * Servicio de Autenticación
 * Model - Maneja la lógica de autenticación
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

class AuthService {
  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      if (response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error al registrar: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Iniciar sesión
   */
  async login(credentials) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      if (response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error al iniciar sesión: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      localStorage.removeItem('authToken');
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Obtener token almacenado
   */
  getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
