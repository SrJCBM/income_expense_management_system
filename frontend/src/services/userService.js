/**
 * Servicio de Usuario
 * Operaciones del perfil del usuario autenticado
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

const buildNetworkError = () =>
  new Error('No se pudo conectar con el servidor para gestionar el perfil.');

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

class UserService {
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.PROFILE);
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al obtener el perfil');
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put(API_ENDPOINTS.USERS.UPDATE, profileData);
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al actualizar el perfil');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put(API_ENDPOINTS.USERS.PASSWORD, passwordData);
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al cambiar la contraseña');
    }
  }

  async resetAllData() {
    try {
      const response = await api.delete(API_ENDPOINTS.USERS.RESET_DATA);
      return response.data;
    } catch (error) {
      handleRequestError(error, 'Error al restablecer los datos');
    }
  }
}

export default new UserService();
