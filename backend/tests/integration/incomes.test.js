/**
 * Tests de Integración - Ingresos (Incomes)
 * Tests E2E para los endpoints de ingresos usando Vitest + Supertest
 * 
 * Cubre:
 * - POST /api/incomes
 * - GET /api/incomes
 * - GET /api/incomes/:id
 * - PUT /api/incomes/:id
 * - DELETE /api/incomes/:id
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server.js';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import Income from '../../src/models/Income.js';
import { generateRandomEmail } from '../fixtures/data.js';
import {
  clearCollections,
  insertTestUser,
  insertTestCategory,
  insertTestIncome,
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
let incomeCategory;
let anotherIncomeCategory;
let anotherUserIncomeCategory;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_tests_12345';
  process.env.JWT_EXPIRE = '7d';
  process.env.NODE_ENV = 'test';

  const email = generateRandomEmail();
  testUser = await insertTestUser({
    name: 'Test User',
    email,
    password: 'TestPassword123!',
  });

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password: 'TestPassword123!',
    });

  testUserToken = loginResponse.body.data.token;

  anotherUserEmail = generateRandomEmail();
  anotherUser = await insertTestUser({
    name: 'Another User',
    email: anotherUserEmail,
    password: anotherUserPassword,
  });

  incomeCategory = await insertTestCategory({
    userId: testUser._id,
    name: 'Salario',
    type: 'income',
    color: '#A8E6CF',
    icon: '💰',
  });

  anotherIncomeCategory = await insertTestCategory({
    userId: testUser._id,
    name: 'Freelance',
    type: 'income',
    color: '#FFD3B6',
    icon: '💻',
  });

  anotherUserIncomeCategory = await insertTestCategory({
    userId: anotherUser._id,
    name: 'Salario',
    type: 'income',
    color: '#A8E6CF',
    icon: '💰',
  });


});

afterEach(async () => {
  await clearCollections(['incomes']);
});

afterAll(async () => {
  // setup.js maneja la desconexión
});

// ============================================
// UTILIDADES
// ============================================
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

/**
 * Helper para crear un ingreso a través del endpoint POST
 */
const createTestIncome = async (userId, token, incomeData) => {
  const response = await request(app)
    .post('/api/incomes')
    .set(getAuthHeaders(token))
    .send(incomeData);
  
  if (response.status !== 201) {
    const errorMsg = response.body.message || response.body.error || JSON.stringify(response.body);
    throw new Error(`Failed to create income (${response.status}): ${errorMsg}`);
  }
  
  return response.body.data;
};

// ============================================
// TESTS: POST /api/incomes - CREAR INGRESO
// ============================================
describe('POST /api/incomes', () => {
  it('Debe crear ingreso con datos válidos → 201', async () => {
    const incomeData = {
      description: 'Salario mensual',
      amount: 2500.00,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.description).toBe(incomeData.description);
    expect(response.body.data.amount).toBe(incomeData.amount);
    expect(response.body.data.category._id.toString()).toBe(incomeCategory._id.toString());
  });

  it('Debe retornar 401 sin token', async () => {
    const incomeData = {
      description: 'Salario mensual',
      amount: 2500.00,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set('Content-Type', 'application/json')
      .send(incomeData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si monto es <= 0', async () => {
    const incomeData = {
      description: 'Ingreso inválido',
      amount: 0,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si monto es negativo', async () => {
    const incomeData = {
      description: 'Ingreso inválido',
      amount: -100,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si categoría no es un MongoId válido', async () => {
    const incomeData = {
      description: 'Ingreso con categoría inválida',
      amount: 2500,
      category: 'invalid-id',
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si fecha es inválida (formato incorrecto)', async () => {
    const incomeData = {
      description: 'Ingreso con fecha inválida',
      amount: 2500,
      category: incomeCategory._id.toString(),
      date: 'fecha-inválida',
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta descripción', async () => {
    const incomeData = {
      amount: 2500,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta monto', async () => {
    const incomeData = {
      description: 'Salario mensual',
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta categoría', async () => {
    const incomeData = {
      description: 'Salario mensual',
      amount: 2500,
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta fecha', async () => {
    const incomeData = {
      description: 'Salario mensual',
      amount: 2500,
      category: incomeCategory._id.toString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe aceptar "concept" como alias para "description"', async () => {
    const incomeData = {
      concept: 'Salario mensual',
      amount: 2500.00,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .post('/api/incomes')
      .set(getAuthHeaders(testUserToken))
      .send(incomeData);

    expect(response.status).toBe(201);
    expect(response.body.data.description).toBe(incomeData.concept);
  });
});

// ============================================
// TESTS: GET /api/incomes - OBTENER INGRESOS
// ============================================
describe('GET /api/incomes', () => {
  it('Debe retornar lista de ingresos del usuario → 200', async () => {
    // Crear algunos ingresos
    await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso 1',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso 2',
      amount: 500,
      category: anotherIncomeCategory._id,
      date: new Date('2024-05-20'),
    });

    const response = await request(app)
      .get('/api/incomes')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  it('Debe retornar array vacío si no hay ingresos', async () => {
    const response = await request(app)
      .get('/api/incomes')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  it('Debe retornar 401 sin token', async () => {
    const response = await request(app)
      .get('/api/incomes')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Solo debe retornar ingresos del usuario actual', async () => {
    // Crear ingreso para testUser
    await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso de test user',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    // Crear ingreso para anotherUser
    await insertTestIncome({
      userId: anotherUser._id,
      description: 'Ingreso de otro usuario',
      amount: 3000,
      category: anotherUserIncomeCategory._id,
      date: new Date('2024-05-20'),
    });

    const response = await request(app)
      .get('/api/incomes')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].description).toBe('Ingreso de test user');
  });

  it('Debe filtrar por categoría (query param ?category=categoryId)', async () => {
    // Crear ingresos con diferentes categorías
    await insertTestIncome({
      userId: testUser._id,
      description: 'Salario',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    await insertTestIncome({
      userId: testUser._id,
      description: 'Freelance',
      amount: 500,
      category: anotherIncomeCategory._id,
      date: new Date('2024-05-20'),
    });

    const response = await request(app)
      .get(`/api/incomes?category=${incomeCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].description).toBe('Salario');
  });

  it('Debe filtrar por mes/año (?month=5&year=2024)', async () => {
    // Crear ingresos en diferentes meses
    await insertTestIncome({
      userId: testUser._id,
      description: 'Mayo',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    await insertTestIncome({
      userId: testUser._id,
      description: 'Junio',
      amount: 500,
      category: incomeCategory._id,
      date: new Date('2024-06-20'),
    });

    const response = await request(app)
      .get('/api/incomes?month=5&year=2024')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].description).toBe('Mayo');
  });

  it('Debe retornar ingresos ordenados por fecha descendente', async () => {
    await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso antiguo',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-01'),
    });

    await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso nuevo',
      amount: 500,
      category: incomeCategory._id,
      date: new Date('2024-05-30'),
    });

    const response = await request(app)
      .get('/api/incomes')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.data[0].description).toBe('Ingreso nuevo');
    expect(response.body.data[1].description).toBe('Ingreso antiguo');
  });
});

// ============================================
// TESTS: GET /api/incomes/:id - OBTENER INGRESO POR ID
// ============================================
describe('GET /api/incomes/:id', () => {
  it('Debe retornar ingreso por ID → 200', async () => {
    const incomeData = {
      description: 'Ingreso para obtener',
      amount: 2500,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const createdIncome = await createTestIncome(testUser._id, testUserToken, incomeData);

    const response = await request(app)
      .get(`/api/incomes/${createdIncome.id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(createdIncome.id);
    expect(response.body.data.description).toBe('Ingreso para obtener');
    expect(response.body.data.amount).toBe(2500);
  });

  it('Debe retornar 404 si ingreso no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/incomes/${fakeId}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 o 400 si ID tiene formato inválido', async () => {
    const response = await request(app)
      .get('/api/incomes/invalid-id')
      .set(getAuthHeaders(testUserToken));

    // El servidor puede retornar 400 (validación de ObjectId) o 404 (no encontrado)
    expect([400, 404]).toContain(response.status);
  });

  it('Debe retornar 404 si el ingreso pertenece a otro usuario', async () => {
    // Crear ingreso para otro usuario
    const incomeOtherUser = await insertTestIncome({
      userId: anotherUser._id,
      description: 'Ingreso de otro usuario',
      amount: 3000,
      category: anotherUserIncomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .get(`/api/incomes/${incomeOtherUser._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404); // No encontrado para el usuario actual
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const income = await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso para obtener',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .get(`/api/incomes/${income._id.toString()}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

// ============================================
// TESTS: PUT /api/incomes/:id - ACTUALIZAR INGRESO
// ============================================
describe('PUT /api/incomes/:id', () => {
  it('Debe actualizar ingreso → 200', async () => {
    const incomeData = {
      description: 'Ingreso original',
      amount: 2500,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const createdIncome = await createTestIncome(testUser._id, testUserToken, incomeData);

    const updateData = {
      description: 'Ingreso actualizado',
      amount: 3000,
      category: anotherIncomeCategory._id.toString(),
      date: new Date('2024-05-20').toISOString(),
    };

    const response = await request(app)
      .put(`/api/incomes/${createdIncome.id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.description).toBe('Ingreso actualizado');
    expect(response.body.data.amount).toBe(3000);
  });

  it('Debe retornar 404 si ingreso no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      description: 'Actualización',
      amount: 2500,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/incomes/${fakeId}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 si el ingreso pertenece a otro usuario', async () => {
    const anotherUserCategory = await insertTestCategory({
      userId: anotherUser._id,
      name: 'Salario Otro Usuario',
      type: 'income',
      color: '#A8E6CF',
      icon: '💰',
    });

    const incomeOtherUser = await insertTestIncome({
      userId: anotherUser._id,
      description: 'Ingreso de otro usuario',
      amount: 3000,
      category: anotherUserCategory._id,
      date: new Date('2024-05-15'),
    });

    const updateData = {
      description: 'Intento de actualización',
      amount: 5000,
      category: anotherUserCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/incomes/${incomeOtherUser._id.toString()}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(404); // No encontrado para el usuario actual
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si datos de actualización son inválidos (monto negativo)', async () => {
    const income = await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso original',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const invalidData = {
      description: 'Actualización inválida',
      amount: -500, // Monto negativo
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/incomes/${income._id.toString()}`)
      .set(getAuthHeaders(testUserToken))
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si datos de actualización son inválidos (monto 0)', async () => {
    const income = await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso original',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const invalidData = {
      description: 'Actualización inválida',
      amount: 0, // Monto cero
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/incomes/${income._id.toString()}`)
      .set(getAuthHeaders(testUserToken))
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const income = await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso original',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const updateData = {
      description: 'Actualización',
      amount: 3000,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/incomes/${income._id.toString()}`)
      .set('Content-Type', 'application/json')
      .send(updateData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe permitir actualizar solo descripción con otros campos presentes', async () => {
    const incomeData = {
      description: 'Ingreso original',
      amount: 2500,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const createdIncome = await createTestIncome(testUser._id, testUserToken, incomeData);

    const partialUpdate = {
      description: 'Solo descripción actualizada',
      amount: 2500, // Mantener valor anterior
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const response = await request(app)
      .put(`/api/incomes/${createdIncome.id}`)
      .set(getAuthHeaders(testUserToken))
      .send(partialUpdate);

    expect(response.status).toBe(200);
    expect(response.body.data.description).toBe('Solo descripción actualizada');
    expect(response.body.data.amount).toBe(2500);
  });
});

// ============================================
// TESTS: DELETE /api/incomes/:id - ELIMINAR INGRESO
// ============================================
describe('DELETE /api/incomes/:id', () => {
  it('Debe eliminar ingreso → 200', async () => {
    const income = await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso a eliminar',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .delete(`/api/incomes/${income._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(income._id.toString());

    // Verificar que fue eliminado
    const getResponse = await request(app)
      .get(`/api/incomes/${income._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(getResponse.status).toBe(404);
  });

  it('Debe retornar 404 si ingreso no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/incomes/${fakeId}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 o 400 si ID tiene formato inválido', async () => {
    const response = await request(app)
      .delete('/api/incomes/invalid-id')
      .set(getAuthHeaders(testUserToken));

    // El servidor puede retornar 400 (validación de ObjectId) o 404 (no encontrado)
    expect([400, 404]).toContain(response.status);
  });

  it('Debe retornar 404 si el ingreso pertenece a otro usuario', async () => {
    const incomeOtherUser = await insertTestIncome({
      userId: anotherUser._id,
      description: 'Ingreso de otro usuario',
      amount: 3000,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .delete(`/api/incomes/${incomeOtherUser._id.toString()}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404); // No encontrado para el usuario actual
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const income = await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso a eliminar',
      amount: 2500,
      category: incomeCategory._id,
      date: new Date('2024-05-15'),
    });

    const response = await request(app)
      .delete(`/api/incomes/${income._id.toString()}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('No debe permitir eliminar ingreso del usuario si está logueado con otro usuario', async () => {
    const incomeData = {
      description: 'Ingreso de test user',
      amount: 2500,
      category: incomeCategory._id.toString(),
      date: new Date('2024-05-15').toISOString(),
    };

    const createdIncome = await createTestIncome(testUser._id, testUserToken, incomeData);

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
      .delete(`/api/incomes/${createdIncome.id}`)
      .set(getAuthHeaders(anotherUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);

    // Verificar que el ingreso sigue existiendo
    const getResponse = await request(app)
      .get(`/api/incomes/${createdIncome.id}`)
      .set(getAuthHeaders(testUserToken));

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.description).toBe('Ingreso de test user');
  });
});

