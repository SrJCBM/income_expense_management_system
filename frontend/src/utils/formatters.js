/**
 * Utilidades de Formateo
 * Funciones para formatear datos en el frontend
 */

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date, locale = 'es-MX') => {
  return new Date(date).toLocaleDateString(locale);
};

export const formatDatetime = (dateTime, locale = 'es-MX') => {
  return new Date(dateTime).toLocaleString(locale);
};

export const truncateText = (text, length = 50) => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const getMonthName = (month) => {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return months[month - 1];
};
