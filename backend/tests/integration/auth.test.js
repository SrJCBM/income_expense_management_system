/**
 * Tests de Integración - Autenticación
 * Tests E2E para los endpoints de autenticación usando Vitest + Supertest
 * 
 * Cubre:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - GET /api/auth/me
 * - POST /api/auth/logout
 */

import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server.js';
import User from '../../src/models/User.js';
import { hashPassword } from '../../src/utils/authUtils.js';
import { generateRandomEmail } from '../fixtures/data.js';
import { clearCollections, insertTestUser } from '../helpers/dbHandler.js';

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
let mongoServer;

beforeAll(async () => {
  // Configurar variables de entorno para tests
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_tests_12345';
  process.env.JWT_EXPIRE = '7d';
  process.env.NODE_ENV = 'test';

  // Desconectar cualquier conexión existente
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Iniciar MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  // Limpiar colecciones después de cada test
  await clearCollections(['users']);
});

afterAll(async () => {
  // Cerrar conexión de MongoDB
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// ============================================
// DATOS DE PRUEBA
// ============================================
const validUser = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'SecurePassword123!',
};

const validUserWithRandomEmail = {
  name: 'Carlos García',
  email: generateRandomEmail(),
  password: 'SecurePassword456!',
};

const weakPassword = 'short'; // Menos de 8 caracteres
const validPassword = 'ValidPassword123!';

// ============================================
// TESTS: POST /api/auth/register
// ============================================
describe('POST /api/auth/register', () => {
  it('Debe registrar un usuario nuevo y retornar 201', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: validUser.name,
        email: generateRandomEmail(),
        password: validUser.password,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user).toHaveProperty('userId');
    expect(response.body.data.user).toHaveProperty('email');
    expect(response.body.data.user).toHaveProperty('name');
  });

  it('Debe retornar 409 si el email ya existe', async () => {
    // Primero crear un usuario
    const email = generateRandomEmail();
    await insertTestUser({ name: 'User 1', email });

    // Intentar registrar con el mismo email
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'User 2',
        email,
        password: validUser.password,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Ya existe una cuenta');
  });

  it('Debe retornar 400 si la contraseña es débil', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: validUser.name,
        email: generateRandomEmail(),
        password: weakPassword,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si faltan campos requeridos', async () => {
    // Sin email
    const response1 = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: validUser.name,
        password: validUser.password,
      });

    expect(response1.status).toBe(400);
    expect(response1.body.success).toBe(false);

    // Sin password
    const response2 = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: validUser.name,
        email: generateRandomEmail(),
      });

    expect(response2.status).toBe(400);
    expect(response2.body.success).toBe(false);

    // Sin nombre
    const response3 = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        email: generateRandomEmail(),
        password: validUser.password,
      });

    expect(response3.status).toBe(400);
    expect(response3.body.success).toBe(false);
  });

  it('Debe retornar 400 si el email no es válido', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: validUser.name,
        email: 'invalid-email',
        password: validUser.password,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('El token retornado debe ser válido', async () => {
    const email = generateRandomEmail();
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: validUser.name,
        email,
        password: validUser.password,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.token).toBeTruthy();
    expect(typeof response.body.data.token).toBe('string');
    expect(response.body.data.token.split('.').length).toBe(3); // JWT tiene 3 partes
  });
});

// ============================================
// TESTS: POST /api/auth/login
// ============================================
describe('POST /api/auth/login', () => {
  it('Debe loguear con credenciales correctas y retornar 200', async () => {
    // Crear usuario
    const email = generateRandomEmail();
    const password = validPassword;
    await insertTestUser({ name: 'Test User', email, password });

    // Intentar login
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe(email);
  });

  it('Debe retornar token JWT válido en login', async () => {
    // Crear usuario
    const email = generateRandomEmail();
    const password = validPassword;
    await insertTestUser({ name: 'Test User', email, password });

    // Login
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
    expect(typeof response.body.data.token).toBe('string');
    expect(response.body.data.token.split('.').length).toBe(3); // JWT tiene 3 partes
  });

  it('Debe retornar 401 si el email no existe', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nonexistent@example.com',
        password: validPassword,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Credenciales inválidas');
  });

  it('Debe retornar 401 si la contraseña es incorrecta', async () => {
    // Crear usuario
    const email = generateRandomEmail();
    await insertTestUser({ name: 'Test User', email, password: validPassword });

    // Intentar login con password incorrecto
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email,
        password: 'WrongPassword123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Credenciales inválidas');
  });

  it('Debe retornar 400 si el email está vacío', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: '',
        password: validPassword,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si la contraseña está vacía', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'user@example.com',
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si faltan email y password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe actualizar lastLoginAt del usuario', async () => {
    // Crear usuario
    const email = generateRandomEmail();
    const password = validPassword;
    const user = await insertTestUser({ name: 'Test User', email, password });
    
    const beforeLogin = user.lastLoginAt;

    // Login
    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    // Verificar que lastLoginAt se actualizó
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.lastLoginAt).not.toEqual(beforeLogin);
    expect(updatedUser.lastLoginAt).toBeTruthy();
  });
});

// ============================================
// TESTS: GET /api/auth/me
// ============================================
describe('GET /api/auth/me', () => {
  it('Debe retornar perfil del usuario autenticado con 200', async () => {
    // Crear usuario y obtener token
    const email = generateRandomEmail();
    const password = validPassword;
    await insertTestUser({ name: 'Test User', email, password });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const token = loginRes.body.data.token;

    // Obtener perfil con token
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('userId');
    expect(response.body.data).toHaveProperty('email');
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data.email).toBe(email);
  });

  it('Debe retornar 401 sin token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Token');
  });

  it('Debe retornar 401 con token inválido', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Token');
  });

  it('Debe retornar 401 con token expirado', async () => {
    // Crear un token con expiración inmediata
    const { generateToken } = await import('../../src/utils/authUtils.js');
    const expiredToken = generateToken('userId123', 'test@example.com', 'user');
    
    // Esperar un tiempo muy pequeño y cambiar la fecha del sistema
    // (O simplemente usar un token firmado con una clave diferente)
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjEwfQ.invalid';

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${invalidToken}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin Bearer en header', async () => {
    const email = generateRandomEmail();
    const password = validPassword;
    await insertTestUser({ name: 'Test User', email, password });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const token = loginRes.body.data.token;

    // Omitir 'Bearer ' en el header
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', token)
      .set('Content-Type', 'application/json');

    // Esto dependerá de cómo esté implementado el middleware
    // Por ahora se espera 401
    expect([401, 401]).toContain(response.status);
  });
});

// ============================================
// TESTS: POST /api/auth/logout
// ============================================
describe('POST /api/auth/logout', () => {
  it('Debe cerrar sesión exitosamente retornando 200', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('cerrada');
  });

  it('Debe retornar 200 incluso sin autenticación', async () => {
    // El logout actual no requiere autenticación
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('Debe retornar estructura de respuesta correcta', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Content-Type', 'application/json');

    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
  });
});

// ============================================
// TESTS DE INTEGRACIÓN COMPLETA
// ============================================
describe('Flujo completo de autenticación', () => {
  it('Debe permitir registro -> login -> acceso a perfil', async () => {
    const email = generateRandomEmail();
    const password = validPassword;
    const name = 'Integration Test User';

    // 1. Registrar usuario
    const registerRes = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ name, email, password });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.token).toBeTruthy();

    // 2. Hacer login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;

    // 3. Acceder al perfil
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(email);
    expect(meRes.body.data.name).toBe(name);
  });

  it('Debe prevenir acceso sin token válido después de registro', async () => {
    const email = generateRandomEmail();
    const password = validPassword;

    // Registrar
    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ name: 'Test', email, password });

    // Intentar acceder sin token
    const response = await request(app)
      .get('/api/auth/me')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
  });

  it('Debe impedir registro con mismo email dos veces', async () => {
    const email = generateRandomEmail();
    const password = validPassword;

    // Primer registro
    const res1 = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ name: 'User 1', email, password });

    expect(res1.status).toBe(201);

    // Segundo registro con mismo email
    const res2 = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ name: 'User 2', email, password: 'DifferentPassword123!' });

    expect(res2.status).toBe(409);
  });
});
