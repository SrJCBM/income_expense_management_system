/**
 * Middleware de Manejo de Errores
 * Centraliza el tratamiento de todos los errores de la aplicación
 */

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const firstError = Object.values(err.errors || {})[0];
    message = firstError?.message || 'Datos inválidos';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Uno de los identificadores enviados no es válido';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'El recurso ya existe y no puede duplicarse';
  }

  console.error(`[ERROR] ${statusCode}: ${message}`);
  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
