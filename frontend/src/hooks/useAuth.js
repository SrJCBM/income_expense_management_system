/**
 * Custom Hook para Autenticación
 * Estados y lógica de autenticación reutilizables
 */

import { useState, useEffect } from 'react';
import authService from '../services/authService.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hidratar la sesión de forma síncrona
    const token = authService.getToken();
    const storedUser = authService.getUser();

    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null); // Limpiar errores previos (Heurística de visibilidad del estado)
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      return response;
    } catch (err) {
      // Propagamos error string o el objeto de errores de validación
      if (err.validationErrors) {
        throw err;
      }
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      // Autologin post-registro (Estrategia elegida para mejor UX)
      setUser(response.data.user);
      return response;
    } catch (err) {
      if (err.validationErrors) {
        throw err; // Propagar errores específicos de campos a useForm
      }
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
