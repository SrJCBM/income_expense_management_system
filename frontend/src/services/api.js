/**
 * Instancia de Axios configurada
 * Servicio centralizado para todas las peticiones HTTP
 */

import axios from 'axios';

const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

const api = axios.create({
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a los headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Documentación para el Backend: 
    // Ante un 401 Unauthorized, forzamos un reload completo con window.location.href 
    // en lugar de una redirección SPA, ya que esto garantiza que se limpie todo 
    // el estado en memoria de React y evita posibles bugs de hidratación o estados zombi.
    if (error.response?.status === 401) {
      const url = error.config?.url ?? '';
      // Auth endpoints returning 401 mean wrong credentials, not session expiry.
      // Only force-logout when a protected route gets a 401 (token expired / revoked).
      const isAuthEndpoint = /\/auth\/(login|register)(\?.*)?$/.test(url);
      if (!isAuthEndpoint) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
