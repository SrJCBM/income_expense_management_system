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
      // El cambio de contraseña también devuelve 401 si la contraseña actual es incorrecta.
      const isCredentialEndpoint =
        /\/auth\/(login|register)(\?.*)?$/.test(url) ||
        /\/users\/profile\/password(\?.*)?$/.test(url);
      if (!isCredentialEndpoint) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        // Hash + reload en lugar de ruta absoluta: la app usa HashRouter y en
        // Electron (file://) o Capacitor (https://localhost) '/login' saldría
        // del origen servido. El reload conserva la limpieza total de estado.
        window.location.hash = '#/login';
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
