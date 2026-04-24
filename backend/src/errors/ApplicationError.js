/**
 * Clase de Error Personalizado
 * Para manejo consistente de errores en la aplicación
 */

export class ApplicationError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message) {
    super(message, 400);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message = 'No autenticado') {
    super(message, 401);
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message) {
    super(message, 409);
  }
}
