/**
 * Formateador de Respuestas
 * Estandariza todas las respuestas de la API
 */

export const successResponse = (data, message = 'Operación exitosa', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

export const errorResponse = (message, statusCode = 500, error = null) => {
  return {
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { error }),
  };
};

export const paginatedResponse = (data, page, limit, total, message = 'Datos obtenidos') => {
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
