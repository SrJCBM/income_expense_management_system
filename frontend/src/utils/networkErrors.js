const NETWORK_ERROR_PATTERNS = [
  'no se pudo conectar',
  'network error',
  'failed to fetch',
  'servidor',
  'server',
];

export const isNetworkError = (error) => {
  if (!error) return false;
  if (error.validationErrors) return false;

  const message = String(error.message || error).toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};

export default isNetworkError;
