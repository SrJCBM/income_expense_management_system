/**
 * Test Utilities - Funciones utilitarias para tests
 * Helpers para crear tokens, simular requests y esperar operaciones
 */

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Crea un token JWT válido para tests
 * @param {Object} payload - Datos a incluir en el token
 * @param {Object} options - Opciones del token
 * @returns {string} Token JWT válido
 */
export const createTestToken = (
  payload = {},
  options = {}
) => {
  const defaultPayload = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'test@example.com',
    role: 'user'
  };

  const defaultOptions = {
    expiresIn: '7d',
    algorithm: 'HS256'
  };

  const mergedPayload = { ...defaultPayload, ...payload };
  const mergedOptions = { ...defaultOptions, ...options };

  const secret = process.env.JWT_SECRET || 'test_secret_key_12345';

  return jwt.sign(mergedPayload, secret, mergedOptions);
};

/**
 * Crea un token JWT expirado (para tests de expiración)
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT expirado
 */
export const createExpiredToken = (payload = {}) => {
  const defaultPayload = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'test@example.com',
    role: 'user'
  };

  const mergedPayload = { ...defaultPayload, ...payload };
  const secret = process.env.JWT_SECRET || 'test_secret_key_12345';

  return jwt.sign(mergedPayload, secret, {
    expiresIn: '-1h' // Expirado hace una hora
  });
};

/**
 * Crea un token JWT inválido (para tests de error)
 * @returns {string} Token JWT inválido
 */
export const createInvalidToken = () => {
  return 'invalid.token.jwt';
};

/**
 * Simula un request autenticado con headers apropiados
 * @param {Object} headers - Headers base
 * @param {string} token - Token JWT (se genera si no se proporciona)
 * @returns {Object} Headers con autorización
 */
export const createAuthHeaders = (headers = {}, token = null) => {
  const authToken = token || createTestToken();

  return {
    ...headers,
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Simula un request autenticado con payload y headers
 * @param {Object} body - Body del request
 * @param {string} method - Método HTTP
 * @param {string} token - Token JWT (se genera si no se proporciona)
 * @param {Object} additionalHeaders - Headers adicionales
 * @returns {Object} Objeto simulando un request
 */
export const createAuthenticatedRequest = (
  body = {},
  method = 'GET',
  token = null,
  additionalHeaders = {}
) => {
  const headers = createAuthHeaders(additionalHeaders, token);

  return {
    method,
    headers,
    body,
    userId: token ? jwt.decode(token).userId : new mongoose.Types.ObjectId().toString()
  };
};

/**
 * Espera a que se cumplan condiciones específicas (polling)
 * Útil para esperar cambios en la BD o completar operaciones asíncronas
 * @param {Function} condition - Función que retorna boolean
 * @param {Object} options - Opciones (maxAttempts, delay)
 * @returns {Promise<boolean>} True si se cumple, false si timeout
 */
export const waitFor = async (
  condition,
  options = {}
) => {
  const {
    maxAttempts = 10,
    delay = 100
  } = options;

  for (let i = 0; i < maxAttempts; i++) {
    if (await condition()) {
      return true;
    }
    await sleep(delay);
  }

  return false;
};

/**
 * Pausa la ejecución por un tiempo determinado
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>}
 */
export const sleep = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Espera a que una promesa se resuelva o rechace con timeout
 * @param {Promise} promise - Promesa a esperar
 * @param {number} timeout - Timeout en ms
 * @returns {Promise<any>} Resultado de la promesa
 */
export const withTimeout = (promise, timeout = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeout)
    )
  ]);
};

/**
 * Retorna una promesa resuelta después del siguiente tick
 * Útil para operaciones asíncronas sincronizadas
 * @returns {Promise<void>}
 */
export const nextTick = () => {
  return new Promise(resolve => process.nextTick(resolve));
};

/**
 * Crea un objeto MockResponse para simular respuestas Express
 * @returns {Object} Mock response object
 */
export const createMockResponse = () => {
  const response = {
    statusCode: 200,
    sentData: null,
    sentStatus: null,
    headers: {},

    status(code) {
      this.sentStatus = code;
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.sentData = data;
      return this;
    },

    send(data) {
      this.sentData = data;
      return this;
    },

    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },

    getHeader(key) {
      return this.headers[key];
    }
  };

  return response;
};

/**
 * Crea un objeto MockRequest para simular requests Express
 * @param {Object} overrides - Propiedades a sobrescribir
 * @returns {Object} Mock request object
 */
export const createMockRequest = (overrides = {}) => {
  const request = {
    method: 'GET',
    url: '/',
    headers: {},
    body: {},
    params: {},
    query: {},
    user: null,

    ...overrides
  };

  return request;
};

/**
 * Genera un ObjectId válido de MongoDB
 * @returns {string} ObjectId como string
 */
export const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

/**
 * Valida si una string es un ObjectId válido
 * @param {string} id - ID a validar
 * @returns {boolean} True si es válido, false si no
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Crea un objeto de contexto para tests con datos comunes
 * @param {Object} overrides - Datos a sobrescribir
 * @returns {Object} Contexto de test
 */
export const createTestContext = (overrides = {}) => {
  const userId = new mongoose.Types.ObjectId();
  const token = createTestToken({ userId: userId.toString() });

  return {
    userId: userId.toString(),
    userIdObject: userId,
    token,
    email: 'test@example.com',
    headers: createAuthHeaders({}, token),
    ...overrides
  };
};

/**
 * Compara dos objetos ignorando campos de timestamp/fecha
 * Útil para comparar documentos de BD sin problemas de timing
 * @param {Object} obj1 - Primer objeto
 * @param {Object} obj2 - Segundo objeto
 * @param {Array<string>} excludeFields - Campos a ignorar
 * @returns {boolean} True si son iguales
 */
export const deepEqualIgnoring = (
  obj1,
  obj2,
  excludeFields = ['_id', 'createdAt', 'updatedAt', '__v']
) => {
  const clean = (obj) => {
    const cleaned = { ...obj };
    excludeFields.forEach(field => delete cleaned[field]);
    return cleaned;
  };

  return JSON.stringify(clean(obj1)) === JSON.stringify(clean(obj2));
};

/**
 * Retry pattern - reintentar una operación asincrónica
 * @param {Function} fn - Función a reintentar
 * @param {Object} options - Opciones (maxAttempts, delay, backoff)
 * @returns {Promise<any>} Resultado de la operación
 */
export const retry = async (
  fn,
  options = {}
) => {
  const {
    maxAttempts = 3,
    delay = 100,
    backoff = 1 // Multiplicador de delay
  } = options;

  let lastError;
  let currentDelay = delay;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxAttempts - 1) {
        await sleep(currentDelay);
        currentDelay = Math.floor(currentDelay * backoff);
      }
    }
  }

  throw lastError;
};
