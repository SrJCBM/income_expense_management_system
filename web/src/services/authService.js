/**
 * Servicio de Autenticación
 * Model - Maneja la lógica de autenticación
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';
const buildNetworkError = () =>
  new Error('No se pudo conectar con el servidor. Por favor intenta de nuevo en unos momentos.');

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

class AuthService {
  saveSession(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  normalizeApiAuthResponse(payload) {
    const token = payload?.data?.token || payload?.token;
    const user = payload?.data?.user || payload?.user;

    if (!token || !user) {
      throw new Error('La respuesta de autenticación no incluye un token válido.');
    }

    this.saveSession(token, user);

    return {
      success: payload?.success ?? true,
      message: payload?.message || 'Operación exitosa',
      data: {
        token,
        user,
      },
    };
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return this.normalizeApiAuthResponse(response.data);
    } catch (error) {
      if (!error.response) {
        throw buildNetworkError();
      }

      // Manejo del formato de errores devuelto por el backend
      if (error.response?.data?.errors) {
        throw { validationErrors: mapBackendValidationErrors(error.response.data.errors) };
      }

      throw new Error(`Error al registrar: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Iniciar sesión
   */
  async login(credentials) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return this.normalizeApiAuthResponse(response.data);
    } catch (error) {
      if (!error.response) {
        throw buildNetworkError();
      }

      // Si el backend devuelve status code pero no un array de errors, propagamos el mensaje
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    // Siempre limpiamos la sesión local independientemente de la respuesta del backend
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Si el backend está caído, igual mantenemos logout local sin ruido en consola.
      if (error.response) {
        console.warn('No se pudo notificar logout al backend:', error.response?.data?.message || error.message);
      }
    }
  }

  /**
   * Obtener token almacenado
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Obtener usuario almacenado
   */
  getUser() {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  }
}

export default new AuthService();
