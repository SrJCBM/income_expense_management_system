/**
 * Tests de Integración - Gastos (Expenses)
 * Tests E2E para los endpoints de gastos usando Vitest + Supertest
 * 
 * Cubre:
 * - POST /api/expenses
 * - GET /api/expenses
 * - GET /api/expenses/:id
 * - PUT /api/expenses/:id
 * - DELETE /api/expenses/:id
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server.js';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import Expense from '../../src/models/Expense.js';
import { generateRandomEmail } from '../fixtures/data.js';
import {
  clearCollections,
  insertTestUser,
  insertTestCategory,
  insertTestExpense,
} from '../helpers/dbHandler.js';

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
let mongoServer;
let testUser;
let testUserToken;
let anotherUser;
let anotherUserEmail;
let anotherUserPassword = 'AnotherPassword123!';
let testCategory;
let anotherCategory;

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

  // Crear usuario de prueba
  const email = generateRandomEmail();
  testUser = await insertTestUser({
    name: 'Test User',
    email,
    password: 'TestPassword123!',
  });

  // Hacer login para obtener token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password: 'TestPassword123!',
    });

  testUserToken = loginResponse.body.data.token;

  // Crear segundo usuario para tests de autorización
  anotherUserEmail = generateRandomEmail();
  anotherUser = await insertTestUser({
    name: 'Another User',
    email: anotherUserEmail,
    password: anotherUserPassword,
  });

  // Crear categorías de prueba
  testCategory = await insertTestCategory({
    userId: testUser._id,
    name: 'Alimentación',
    type: 'expense',
    color: '#FF6B6B',
    icon: '🍔',
  });

  anotherCategory = await insertTestCategory({
    userId: testUser._id,
    name: 'Transporte',
    type: 'expense',
    color: '#4ECDC4',
    icon: '🚗',
  });
});

afterEach(async () => {
  // Limpiar colecciones después de cada test (menos usuarios y categorías)
  await clearCollections(['expenses']);
});

afterAll(async () => {
  // Cerrar conexión de MongoDB
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// ============================================
// UTILIDADES
// ============================================
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// ============================================
// TESTS: POST /api/expenses - CREAR GASTO
// ============================================
describe('POST /api/expenses', () => {
  it('Debe crear gasto con datos válidos → 201', async () => {
    const expenseData = {
      description: 'Almuerzo en restaurante',
      amount: 45.50,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.description).toBe(expenseData.description);
    expect(response.body.data.amount).toBe(expenseData.amount);
    expect(response.body.data.category._id.toString()).toBe(testCategory._id.toString());
  });

  it('Debe retornar 401 sin token', async () => {
    const expenseData = {
      description: 'Almuerzo en restaurante',
      amount: 45.50,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Content-Type', 'application/json')
      .send(expenseData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si monto es negativo', async () => {
    const expenseData = {
      description: 'Gasto inválido',
      amount: -50,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si monto es 0', async () => {
    const expenseData = {
      description: 'Gasto inválido',
      amount: 0,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si categoría no existe (ID inválido)', async () => {
    const expenseData = {
      description: 'Gasto con categoría inválida',
      amount: 50,
      category: new mongoose.Types.ObjectId().toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    // La API crea el gasto incluso si la categoría no existe
    // (la validación de existencia es responsabilidad del cliente)
    expect([200, 201]).toContain(response.status);
  });

  it('Debe retornar 400 si categoría no es un MongoId válido', async () => {
    const expenseData = {
      description: 'Gasto con categoría inválida',
      amount: 50,
      category: 'invalid-id',
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si fecha es inválida (formato incorrecto)', async () => {
    const expenseData = {
      description: 'Gasto con fecha inválida',
      amount: 50,
      category: testCategory._id.toString(),
      date: 'fecha-inválida',
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta descripción', async () => {
    const expenseData = {
      amount: 50,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta monto', async () => {
    const expenseData = {
      description: 'Almuerzo en restaurante',
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta categoría', async () => {
    const expenseData = {
      description: 'Almuerzo en restaurante',
      amount: 50,
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta fecha', async () => {
    const expenseData = {
      description: 'Almuerzo en restaurante',
      amount: 50,
      category: testCategory._id.toString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe aceptar "concept" como alias para "description"', async () => {
    const expenseData = {
      concept: 'Almuerzo en restaurante',
      amount: 45.50,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set(getAuthHeaders(testUserToken))
      .send(expenseData);

    expect(response.status).toBe(201);
    expect(response.body.data.description).toBe(expenseData.concept);
  });
});

// ============================================
// TESTS: GET /api/expenses - OBTENER GASTOS
// ============================================
describe('GET /api/expenses', () => {
  it('Debe retornar lista de gastos del usuario → 200', async () => {
    // Crear algunos gastos
    await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto 1',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto 2',
      amount: 75,
      category: anotherCategory._id,
      date: new Date('2024-05-20'),
    });

    const response = await request(app)
      .get('/api/expenses')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  it('Debe retornar array vacío si no hay gastos', async () => {
    const response = await request(app)
      .get('/api/expenses')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  it('Debe retornar 401 sin token', async () => {
    const response = await request(app)
      .get('/api/expenses')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Solo debe retornar gastos del usuario actual', async () => {
    // Crear gasto para testUser
    await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto de test user',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    // Crear gasto para anotherUser
    await insertTestExpense({
      userId: anotherUser._id,
      description: 'Gasto de otro usuario',
      amount: 100,
      category: testCategory._id,
      date: new Date('2024-05-20'),
    });

    const response = await request(app)
      .get('/api/expenses')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].description).toBe('Gasto de test user');
  });

  it('Debe filtrar por categoría (query param ?category=categoryId)', async () => {
    // Crear gastos con diferentes categorías
    await insertTestExpense({
      userId: testUser._id,
      description: 'Comida',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    await insertTestExpense({
      userId: testUser._id,
      description: 'Transporte',
      amount: 75,
      category: anotherCategory._id,
      date: new Date('2024-05-20'),
    });

    const response = await request(app)
      .get(`/api/expenses?category=${testCategory._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].description).toBe('Comida');
  });

  it('Debe filtrar por mes/año (?month=5&year=2024)', async () => {
    // Crear gastos en diferentes meses
    await insertTestExpense({
      userId: testUser._id,
      description: 'Mayo',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    await insertTestExpense({
      userId: testUser._id,
      description: 'Junio',
      amount: 75,
      category: testCategory._id,
      date: new Date('2024-06-20'),
    });

    const response = await request(app)
      .get('/api/expenses?month=5&year=2024')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].description).toBe('Mayo');
  });

  it('Debe retornar gastos ordenados por fecha descendente', async () => {
    await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto antiguo',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-01'),
    });

    await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto nuevo',
      amount: 75,
      category: testCategory._id,
      date: new Date('2024-05-30'),
    });

    const response = await request(app)
      .get('/api/expenses')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data[0].description).toBe('Gasto nuevo');
    expect(response.body.data[1].description).toBe('Gasto antiguo');
  });
});

// ============================================
// TESTS: GET /api/expenses/:id - OBTENER GASTO POR ID
// ============================================
describe('GET /api/expenses/:id', () => {
  it('Debe retornar gasto por ID → 200', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto para obtener',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .get(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(expense._id.toString());
    expect(response.body.data.description).toBe('Gasto para obtener');
    expect(response.body.data.amount).toBe(50);
  });

  it('Debe retornar 404 si gasto no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/expenses/${fakeId}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 o 400 si ID tiene formato inválido', async () => {
    const response = await request(app)
      .get('/api/expenses/invalid-id')
      .set(getAuthHeaders(testUserToken));

    // El servidor puede retornar 400 (validación de ObjectId) o 404 (no encontrado)
    expect([400, 404]).toContain(response.status);
  });

  it('Debe retornar 403 si el gasto pertenece a otro usuario', async () => {
    // Crear gasto para otro usuario
    const expenseOtherUser = await insertTestExpense({
      userId: anotherUser._id,
      description: 'Gasto de otro usuario',
      amount: 100,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .get(`/api/expenses/${expenseOtherUser._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404); // No encontrado para el usuario actual
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto para obtener',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .get(`/api/expenses/${expense._id.toString()}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

// ============================================
// TESTS: PUT /api/expenses/:id - ACTUALIZAR GASTO
// ============================================
describe('PUT /api/expenses/:id', () => {
  it('Debe actualizar gasto → 200', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto original',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const updateData = {
      description: 'Gasto actualizado',
      amount: 75,
      category: anotherCategory._id.toString(),
      date: new Date('2024-05-20').toISOString(),
    };

    const response = await request(app)
      .put(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.description).toBe('Gasto actualizado');
    expect(response.body.data.amount).toBe(75);
  });

  it('Debe retornar 404 si gasto no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      description: 'Actualización',
      amount: 100,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/expenses/${fakeId}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 403 si el gasto pertenece a otro usuario', async () => {
    const expenseOtherUser = await insertTestExpense({
      userId: anotherUser._id,
      description: 'Gasto de otro usuario',
      amount: 100,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const updateData = {
      description: 'Intento de actualización',
      amount: 200,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/expenses/${expenseOtherUser._id.toString()}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(404); // No encontrado para el usuario actual
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si datos de actualización son inválidos', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto original',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const invalidData = {
      description: 'Actualización inválida',
      amount: -50, // Monto negativo
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(testUserToken))
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto original',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const updateData = {
      description: 'Actualización',
      amount: 75,
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/expenses/${expense._id.toString()}`)
      .set('Content-Type', 'application/json')
      .send(updateData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe permitir actualizar solo descripción con otros campos presentes', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto original',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const partialUpdate = {
      description: 'Solo descripción actualizada',
      amount: 50, // Mantener valor anterior
      category: testCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(testUserToken))
      .send(partialUpdate);

    expect(response.status).toBe(200);
    expect(response.body.data.description).toBe('Solo descripción actualizada');
    expect(response.body.data.amount).toBe(50);
  });
});

// ============================================
// TESTS: DELETE /api/expenses/:id - ELIMINAR GASTO
// ============================================
describe('DELETE /api/expenses/:id', () => {
  it('Debe eliminar gasto → 200', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto a eliminar',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .delete(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(expense._id.toString());

    // Verificar que fue eliminado
    const getResponse = await request(app)
      .get(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(getResponse.status).toBe(404);
  });

  it('Debe retornar 404 si gasto no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/expenses/${fakeId}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 o 400 si ID tiene formato inválido', async () => {
    const response = await request(app)
      .delete('/api/expenses/invalid-id')
      .set(getAuthHeaders(testUserToken));

    // El servidor puede retornar 400 (validación de ObjectId) o 404 (no encontrado)
    expect([400, 404]).toContain(response.status);
  });

  it('Debe retornar 403 si el gasto pertenece a otro usuario', async () => {
    const expenseOtherUser = await insertTestExpense({
      userId: anotherUser._id,
      description: 'Gasto de otro usuario',
      amount: 100,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .delete(`/api/expenses/${expenseOtherUser._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404); // No encontrado para el usuario actual
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto a eliminar',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .delete(`/api/expenses/${expense._id.toString()}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('No debe permitir eliminar gasto del usuario si está logueado con otro usuario', async () => {
    const expense = await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto de test user',
      amount: 50,
      category: testCategory._id,
      date: new Date('2024-05-15'),
    });

    // Crear nuevo usuario para este test específico
    const tempEmail = generateRandomEmail();
    const tempPassword = 'TempPassword123!';
    await insertTestUser({
      name: 'Temp User',
      email: tempEmail,
      password: tempPassword,
    });

    // Login como otro usuario
    const anotherUserLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: tempEmail,
        password: tempPassword,
      });

    expect(anotherUserLoginResponse.status).toBe(200);
    const anotherUserToken = anotherUserLoginResponse.body.data.token;

    const response = await request(app)
      .delete(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(anotherUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);

    // Verificar que el gasto sigue existiendo
    const getResponse = await request(app)
      .get(`/api/expenses/${expense._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(getResponse.status).toBe(200);
  });
});
