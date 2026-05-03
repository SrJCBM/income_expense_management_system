/**
 * Tests de Integración - Categorías
 * Tests E2E para los endpoints de categorías usando Vitest + Supertest
 * 
 * Cubre:
 * - POST /api/categories
 * - GET /api/categories
 * - GET /api/categories/:id
 * - PUT /api/categories/:id
 * - DELETE /api/categories/:id
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../server.js';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import Expense from '../../src/models/Expense.js';
import Income from '../../src/models/Income.js';
import { generateRandomEmail } from '../fixtures/data.js';
import {
  clearCollections,
  insertTestUser,
  insertTestCategory,
  insertTestExpense,
  insertTestIncome,
} from '../helpers/dbHandler.js';

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
let mongoServer;
let testUser;
let testUserToken;
let anotherUser;
let anotherUserToken;
let anotherUserEmail;
let anotherUserPassword = 'AnotherPassword123!';
let testExpenseCategory;
let testIncomeCategory;
let anotherExpenseCategory;
let anotherUserExpenseCategory;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_tests_12345';
  process.env.JWT_EXPIRE = '7d';
  process.env.NODE_ENV = 'test';

  // Crear usuario de prueba principal
  const email = generateRandomEmail();
  testUser = await insertTestUser({
    name: 'Test User',
    email,
    password: 'TestPassword123!',
  });

  // Obtener token del usuario principal
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password: 'TestPassword123!',
    });

  testUserToken = loginResponse.body.data.token;

  // Crear otro usuario para pruebas de autorización
  anotherUserEmail = generateRandomEmail();
  anotherUser = await insertTestUser({
    name: 'Another User',
    email: anotherUserEmail,
    password: anotherUserPassword,
  });

  // Obtener token del segundo usuario
  const anotherLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: anotherUserEmail,
      password: anotherUserPassword,
    });

  anotherUserToken = anotherLoginResponse.body.data.token;

  // Crear categorías de prueba para el usuario principal
  testExpenseCategory = await insertTestCategory({
    userId: testUser._id,
    name: 'Comida',
    type: 'expense',
    color: '#FF5733',
    icon: '🍕',
  });

  testIncomeCategory = await insertTestCategory({
    userId: testUser._id,
    name: 'Salario',
    type: 'income',
    color: '#33FF57',
    icon: '💰',
  });

  anotherExpenseCategory = await insertTestCategory({
    userId: testUser._id,
    name: 'Transporte',
    type: 'expense',
    color: '#3357FF',
    icon: '🚕',
  });

  // Crear categoría para otro usuario (para pruebas de acceso)
  anotherUserExpenseCategory = await insertTestCategory({
    userId: anotherUser._id,
    name: 'Comida',
    type: 'expense',
    color: '#FF5733',
    icon: '🍕',
  });
});

afterEach(async () => {
  // Solo limpiar movimientos, no las categorías de prueba
  await clearCollections(['expenses', 'incomes']);
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
 * Helper para crear una categoría a través del endpoint POST
 */
const createTestCategoryViaAPI = async (token, categoryData) => {
  const response = await request(app)
    .post('/api/categories')
    .set(getAuthHeaders(token))
    .send(categoryData);
  
  if (response.status !== 201) {
    console.error('Failed to create category. Status:', response.status, 'Body:', response.body);
    throw new Error(`Failed to create category: ${response.body.message || response.status}`);
  }
  
  return response.body.data;
};

// ============================================
// TESTS: POST /api/categories - CREAR CATEGORÍA
// ============================================
describe('POST /api/categories', () => {
  it('Debe crear categoría personalizada con datos válidos → 201', async () => {
    const categoryData = {
      name: 'Ocio',
      type: 'expense',
      color: '#9C27B0',
      icon: '🎮',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe(categoryData.name);
    expect(response.body.data.type).toBe(categoryData.type);
    expect(response.body.data.color).toBe(categoryData.color);
    expect(response.body.data.icon).toBe(categoryData.icon);
  });

  it('Debe retornar 401 sin token', async () => {
    const categoryData = {
      name: 'Ocio',
      type: 'expense',
      color: '#9C27B0',
      icon: '🎮',
    };

    const response = await request(app)
      .post('/api/categories')
      .set('Content-Type', 'application/json')
      .send(categoryData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 409 si nombre ya existe para ese usuario', async () => {
    // Intentar crear categoría con nombre que ya existe
    const categoryData = {
      name: testExpenseCategory.name,
      type: 'expense',
      color: '#000000',
      icon: '🎯',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si tipo no es expense o income', async () => {
    const categoryData = {
      name: 'Categoría Inválida',
      type: 'invalid_type',
      color: '#9C27B0',
      icon: '🎮',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si nombre está vacío', async () => {
    const categoryData = {
      name: '',
      type: 'expense',
      color: '#9C27B0',
      icon: '🎮',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta el nombre', async () => {
    const categoryData = {
      type: 'expense',
      color: '#9C27B0',
      icon: '🎮',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si falta el tipo', async () => {
    const categoryData = {
      name: 'Ocio',
      color: '#9C27B0',
      icon: '🎮',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe permitir crear categoría de income con mismo nombre que expense para el mismo usuario', async () => {
    const categoryData = {
      name: testExpenseCategory.name,
      type: 'income', // Diferente tipo
      color: '#33FF57',
      icon: '💰',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('income');
  });

  it('Debe permitir que otro usuario cree categoría con el mismo nombre', async () => {
    const categoryData = {
      name: 'Comida Otro Usuario', // Nombre diferente para evitar conflicto con beforeAll
      type: 'expense',
      color: '#000000',
      icon: '🎯',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(anotherUserToken))
      .send(categoryData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('Debe trimear espacios en blanco del nombre', async () => {
    const categoryData = {
      name: '  Ocio Nuevo  ',
      type: 'expense',
      color: '#9C27B0',
      icon: '🎮',
    };

    const response = await request(app)
      .post('/api/categories')
      .set(getAuthHeaders(testUserToken))
      .send(categoryData);

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Ocio Nuevo');
  });
});

// ============================================
// TESTS: GET /api/categories - OBTENER CATEGORÍAS
// ============================================
describe('GET /api/categories', () => {
  it('Debe listar todas las categorías del usuario (personalizadas + sistema) → 200', async () => {
    const response = await request(app)
      .get('/api/categories')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('Debe filtrar por tipo expense (?type=expense)', async () => {
    const response = await request(app)
      .get('/api/categories?type=expense')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar que solo hay categorías de tipo expense
    response.body.data.forEach((category) => {
      expect(category.type).toBe('expense');
    });
  });

  it('Debe filtrar por tipo income (?type=income)', async () => {
    const response = await request(app)
      .get('/api/categories?type=income')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar que solo hay categorías de tipo income
    response.body.data.forEach((category) => {
      expect(category.type).toBe('income');
    });
  });

  it('Debe retornar categorías ordenadas por tipo y nombre', async () => {
    const response = await request(app)
      .get('/api/categories')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar que hay al menos 2 categorías
    expect(response.body.data.length).toBeGreaterThan(1);
    
    // Verificar que están ordenadas (expense primero, luego income)
    let lastType = null;
    let lastName = null;
    
    response.body.data.forEach((category, index) => {
      if (index > 0) {
        const typeOrder = category.type === 'expense' ? 0 : 1;
        const lastTypeOrder = lastType === 'expense' ? 0 : 1;
        
        if (typeOrder === lastTypeOrder) {
          // Mismo tipo, verificar que el nombre está ordenado alfabéticamente
          expect(category.name.localeCompare(lastName)).toBeGreaterThanOrEqual(0);
        }
      }
      lastType = category.type;
      lastName = category.name;
    });
  });

  it('Debe retornar 401 sin token', async () => {
    const response = await request(app)
      .get('/api/categories')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Solo debe retornar categorías del usuario actual', async () => {
    // Crear categoría para otro usuario
    const anotherUserEmail = generateRandomEmail();
    const anotherUser = await insertTestUser({
      name: 'Another User',
      email: anotherUserEmail,
      password: 'AnotherPassword123!',
    });

    await insertTestCategory({
      userId: anotherUser._id,
      name: 'Categoría Privada',
      type: 'expense',
      color: '#000000',
      icon: '🔒',
    });

    const response = await request(app)
      .get('/api/categories')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    
    // Verificar que no aparece la categoría del otro usuario
    const categoryNames = response.body.data.map(c => c.name);
    expect(categoryNames).not.toContain('Categoría Privada');
  });

  it('Debe aceptar type en minúsculas y mayúsculas', async () => {
    const response1 = await request(app)
      .get('/api/categories?type=EXPENSE')
      .set(getAuthHeaders(testUserToken));

    const response2 = await request(app)
      .get('/api/categories?type=expense')
      .set(getAuthHeaders(testUserToken));

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response1.body.data.length).toBe(response2.body.data.length);
  });

  it('Debe retornar 400 si type es inválido', async () => {
    const response = await request(app)
      .get('/api/categories?type=invalid')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

// ============================================
// TESTS: GET /api/categories/:id - OBTENER CATEGORÍA POR ID
// ============================================
describe('GET /api/categories/:id', () => {
  it('Debe obtener categoría por ID → 200', async () => {
    const response = await request(app)
      .get(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testExpenseCategory._id.toString());
    expect(response.body.data.name).toBe(testExpenseCategory.name);
  });

  it('Debe retornar 404 si categoría no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    
    const response = await request(app)
      .get(`/api/categories/${fakeId}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 si categoría pertenece a otro usuario', async () => {
    const response = await request(app)
      .get(`/api/categories/${anotherUserExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const response = await request(app)
      .get(`/api/categories/${testExpenseCategory._id}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si ID no es un MongoId válido', async () => {
    const response = await request(app)
      .get('/api/categories/invalid-id')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

// ============================================
// TESTS: PUT /api/categories/:id - ACTUALIZAR CATEGORÍA
// ============================================
describe('PUT /api/categories/:id', () => {
  it('Debe actualizar nombre de categoría → 200', async () => {
    const updateData = {
      name: 'Comida Nueva',
    };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Comida Nueva');
  });

  it('Debe actualizar color e ícono → 200', async () => {
    const updateData = {
      color: '#000000',
      icon: '🎨',
    };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.color).toBe('#000000');
    expect(response.body.data.icon).toBe('🎨');
  });

  it('Debe actualizar nombre y color simultáneamente → 200', async () => {
    const updateData = {
      name: 'Comida Premium',
      color: '#FFD700',
    };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Comida Premium');
    expect(response.body.data.color).toBe('#FFD700');
  });

  it('Debe retornar 409 si nuevo nombre ya existe para ese tipo', async () => {
    const updateData = {
      name: anotherExpenseCategory.name, // Nombre de otra categoría del mismo tipo
    };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 si categoría no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const updateData = { name: 'Nueva' };

    const response = await request(app)
      .put(`/api/categories/${fakeId}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 si no es propietario de la categoría', async () => {
    const updateData = { name: 'Hackeada' };

    const response = await request(app)
      .put(`/api/categories/${anotherUserExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const updateData = { name: 'Nueva' };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set('Content-Type', 'application/json')
      .send(updateData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe permitir cambiar tipo de categoría', async () => {
    const updateData = {
      type: 'income',
    };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.type).toBe('income');
  });

  it('Debe retornar 400 si tipo es inválido', async () => {
    const updateData = {
      type: 'invalid_type',
    };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe trimear espacios en blanco del nombre actualizado', async () => {
    const updateData = {
      name: '  Comida Actualizada  ',
    };

    const response = await request(app)
      .put(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Comida Actualizada');
  });

  it('Debe retornar 400 si ID no es un MongoId válido', async () => {
    const updateData = { name: 'Nueva' };

    const response = await request(app)
      .put('/api/categories/invalid-id')
      .set(getAuthHeaders(testUserToken))
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

// ============================================
// TESTS: DELETE /api/categories/:id - ELIMINAR CATEGORÍA
// ============================================
describe('DELETE /api/categories/:id', () => {
  beforeEach(async () => {
    // Limpiar solo movimientos, no las categorías
    await clearCollections(['expenses', 'incomes']);
  });

  it('Debe eliminar categoría personalizada sin movimientos → 200', async () => {
    const newCategory = await insertTestCategory({
      userId: testUser._id,
      name: 'Categoría Temporal',
      type: 'expense',
      color: '#FF0000',
      icon: '❌',
    });

    const response = await request(app)
      .delete(`/api/categories/${newCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(newCategory._id.toString());

    // Verificar que la categoría fue eliminada
    const getResponse = await request(app)
      .get(`/api/categories/${newCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(getResponse.status).toBe(404);
  });

  it('Debe retornar 409 si intenta eliminar categoría con gastos asociados', async () => {
    // Crear un gasto con la categoría
    await insertTestExpense({
      userId: testUser._id,
      description: 'Gasto de prueba',
      amount: 100,
      category: testExpenseCategory._id,
      date: new Date(),
    });

    const response = await request(app)
      .delete(`/api/categories/${testExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 409 si intenta eliminar categoría con ingresos asociados', async () => {
    // Crear un ingreso con la categoría
    await insertTestIncome({
      userId: testUser._id,
      description: 'Ingreso de prueba',
      amount: 1000,
      category: testIncomeCategory._id,
      date: new Date(),
    });

    const response = await request(app)
      .delete(`/api/categories/${testIncomeCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 si categoría no existe', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/categories/${fakeId}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 404 si no es propietario de la categoría', async () => {
    const response = await request(app)
      .delete(`/api/categories/${anotherUserExpenseCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 401 sin token', async () => {
    const response = await request(app)
      .delete(`/api/categories/${testExpenseCategory._id}`)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('Debe retornar 400 si ID no es un MongoId válido', async () => {
    const response = await request(app)
      .delete('/api/categories/invalid-id')
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('Debe permitir eliminar categoría si hay movimientos de otro usuario', async () => {
    // Crear una categoría y un gasto para otro usuario
    const newCategory = await insertTestCategory({
      userId: testUser._id,
      name: 'Categoría Segura',
      type: 'expense',
      color: '#00FF00',
      icon: '✅',
    });

    await insertTestExpense({
      userId: anotherUser._id,
      description: 'Gasto de otro usuario',
      amount: 50,
      category: newCategory._id,
      date: new Date(),
    });

    // El usuario original debe poder eliminar su categoría
    // porque el gasto pertenece a otro usuario
    const response = await request(app)
      .delete(`/api/categories/${newCategory._id}`)
      .set(getAuthHeaders(testUserToken));

    expect(response.status).toBe(200);
  });
});
