/**
 * Contexto de Configuración
 * Preferencias del usuario (moneda) disponibles en toda la app
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import authService from '../services/authService.js';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'Dólar estadounidense (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'MXN', label: 'Peso mexicano (MXN)' },
  { code: 'PEN', label: 'Sol peruano (PEN)' },
  { code: 'COP', label: 'Peso colombiano (COP)' },
  { code: 'ARS', label: 'Peso argentino (ARS)' },
  { code: 'CLP', label: 'Peso chileno (CLP)' },
];

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => authService.getUser()?.currency || 'USD');

  const setCurrency = useCallback((newCurrency) => {
    setCurrencyState(newCurrency);

    // Mantener sincronizada la sesión almacenada para que persista entre recargas
    const storedUser = authService.getUser();
    if (storedUser) {
      localStorage.setItem('authUser', JSON.stringify({ ...storedUser, currency: newCurrency }));
    }
  }, []);

  const formatCurrency = useCallback(
    (value) =>
      new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(Number(value || 0)),
    [currency]
  );

  const contextValue = useMemo(
    () => ({ currency, setCurrency, formatCurrency }),
    [currency, setCurrency, formatCurrency]
  );

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings debe usarse dentro de un SettingsProvider');
  }

  return context;
};
