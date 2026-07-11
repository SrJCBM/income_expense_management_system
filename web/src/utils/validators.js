/**
 * Validadores de Frontend
 * Funciones de validación reutilizables
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) > 0;
};

export const validateDate = (date) => {
  return !isNaN(new Date(date).getTime());
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};
