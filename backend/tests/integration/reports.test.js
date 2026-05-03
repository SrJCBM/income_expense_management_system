/**
 * Tests de Integración - Reportes (Reports)
 * Tests E2E para los endpoints de reportes usando Vitest + Supertest
 * 
 * Cubre:
 * - GET /api/reports/summary
 * - GET /api/reports/monthly
 * - GET /api/reports/yearly
 * - GET /api/reports/category-breakdown
 * - GET /api/reports/filters
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
let testCategories = {};
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;

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
  const userEmail = generateRandomEmail();
  testUser = await insertTestUser({
    name: 'Test User Reports',
    email: userEmail,
    password: 'TestPassword123!',
  });

  // Hacer login para obtener token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: userEmail,
      password: 'TestPassword123!',
    });

  testUserToken = loginResponse.body.data.token;

  // Crear categorías de prueba
  testCategories.food = await insertTestCategory({
    userId: testUser._id,
    name: 'Alimentación',
    type: 'expense',
    color: '#FF6B6B',
    icon: '🍔',
  });

  testCategories.transport = await insertTestCategory({
    userId: testUser._id,
    name: 'Transporte',
    type: 'expense',
    color: '#4ECDC4',
    icon: '🚗',
  });

  testCategories.entertainment = await insertTestCategory({
    userId: testUser._id,
    name: 'Entretenimiento',
    type: 'expense',
    color: '#FFE66D',
    icon: '🎬',
  });

  testCategories.salary = await insertTestCategory({
    userId: testUser._id,
    name: 'Salario',
    type: 'income',
    color: '#A8E6CF',
    icon: '💰',
  });

  testCategories.freelance = await insertTestCategory({
    userId: testUser._id,
    name: 'Freelance',
    type: 'income',
    color: '#FFD3B6',
    icon: '💻',
  });

  // ====================================
  // CREAR DATOS VARIADOS DE PRUEBA
  // ====================================
  
  // GASTOS - MES ACTUAL (5 de mayo 2024)
  await insertTestExpense({
    userId: testUser._id,
    amount: 45.50,
    description: 'Almuerzo en restaurante',
    category: testCategories.food._id,
    date: new Date(currentYear, currentMonth - 1, 5),
  });

  await insertTestExpense({
    userId: testUser._id,
    amount: 25.00,
    description: 'Desayuno en cafetería',
    category: testCategories.food._id,
    date: new Date(currentYear, currentMonth - 1, 10),
  });

  await insertTestExpense({
    userId: testUser._id,
    amount: 30.00,
    description: 'Pasaje en taxi',
    category: testCategories.transport._id,
    date: new Date(currentYear, currentMonth - 1, 8),
  });

  await insertTestExpense({
    userId: testUser._id,
    amount: 50.00,
    description: 'Entrada al cine',
    category: testCategories.entertainment._id,
    date: new Date(currentYear, currentMonth - 1, 15),
  });

  await insertTestExpense({
    userId: testUser._id,
    amount: 80.00,
    description: 'Cena elegante',
    category: testCategories.food._id,
    date: new Date(currentYear, currentMonth - 1, 20),
  });

  // GASTOS - MES ANTERIOR (abril 2024)
  await insertTestExpense({
    userId: testUser._id,
    amount: 35.00,
    description: 'Comida rápida',
    category: testCategories.food._id,
    date: new Date(currentYear, currentMonth - 2, 5),
  });

  await insertTestExpense({
    userId: testUser._id,
    amount: 40.00,
    description: 'Uber al trabajo',
    category: testCategories.transport._id,
    date: new Date(currentYear, currentMonth - 2, 10),
  });

  await insertTestExpense({
    userId: testUser._id,
    amount: 55.00,
    description: 'Compra en tienda',
    category: testCategories.entertainment._id,
    date: new Date(currentYear, currentMonth - 2, 18),
  });

  // INGRESOS - MES ACTUAL (mayo 2024)
  await insertTestIncome({
    userId: testUser._id,
    amount: 2500.00,
    description: 'Salario mensual',
    category: testCategories.salary._id,
    date: new Date(currentYear, currentMonth - 1, 1),
  });

  await insertTestIncome({
    userId: testUser._id,
    amount: 300.00,
    description: 'Proyecto freelance',
    category: testCategories.freelance._id,
    date: new Date(currentYear, currentMonth - 1, 15),
  });

  // INGRESOS - MES ANTERIOR (abril 2024)
  await insertTestIncome({
    userId: testUser._id,
    amount: 2500.00,
    description: 'Salario mensual',
    category: testCategories.salary._id,
    date: new Date(currentYear, currentMonth - 2, 1),
  });

  await insertTestIncome({
    userId: testUser._id,
    amount: 200.00,
    description: 'Venta online',
    category: testCategories.freelance._id,
    date: new Date(currentYear, currentMonth - 2, 25),
  });
});

afterEach(async () => {
  // Limpieza después de cada test (opcional)
  // En este caso no limpiaremos porque necesitamos los datos para todos los tests
});

afterAll(async () => {
  // Limpiar BD y desconectar
  await clearCollections();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// ============================================
// TESTS: GET /api/reports/summary
// ============================================
describe('GET /api/reports/summary', () => {
  it('Debe retornar resumen general con token válido - 200', async () => {
    const response = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('totalIncome');
    expect(response.body.data).toHaveProperty('totalExpense');
    expect(response.body.data).toHaveProperty('balance');
    expect(response.body.data).toHaveProperty('expensesByCategory');
  });

  it('Debe retornar 401 sin token de autenticación', async () => {
    const response = await request(app)
      .get('/api/reports/summary')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  it('Debe retornar 401 con token inválido', async () => {
    const response = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', 'Bearer invalid.token.jwt')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  it('Debe calcular correctamente los totales del mes actual', async () => {
    const response = await request(app)
      .get(`/api/reports/summary?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;

    // Ingresos del mes actual: 2500 + 300 = 2800
    expect(data.totalIncome).toBe(2800);

    // Gastos del mes actual: 45.50 + 25 + 30 + 50 + 80 = 230.50
    expect(data.totalExpense).toBe(230.50);

    // Balance: 2800 - 230.50 = 2569.50
    expect(data.balance).toBe(2569.50);
  });

  it('Debe incluir desglose por categoría en gastos', async () => {
    const response = await request(app)
      .get(`/api/reports/summary?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.expensesByCategory).toBeInstanceOf(Array);
    expect(data.expensesByCategory.length).toBeGreaterThan(0);

    // Verificar estructura de cada categoría
    data.expensesByCategory.forEach((category) => {
      expect(category).toHaveProperty('categoryId');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('amount');
      expect(category).toHaveProperty('color');
      expect(category).toHaveProperty('percentage');
      expect(category.amount).toBeGreaterThanOrEqual(0);
      expect(category.percentage).toBeGreaterThanOrEqual(0);
    });
  });

  it('Debe calcular correctamente percentajes por categoría', async () => {
    const response = await request(app)
      .get(`/api/reports/summary?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    const totalExpense = data.totalExpense;

    data.expensesByCategory.forEach((category) => {
      const expectedPercentage = (category.amount / totalExpense) * 100;
      expect(Math.round(category.percentage * 100) / 100).toBeCloseTo(expectedPercentage, 1);
    });
  });

  it('Debe retornar resumen de mes diferente al consultar con parámetros', async () => {
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const response = await request(app)
      .get(`/api/reports/summary?month=${previousMonth}&year=${previousYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;

    // Abril tiene: ingresos 2700 (2500 + 200), gastos 130 (35 + 40 + 55)
    expect(data.totalIncome).toBe(2700);
    expect(data.totalExpense).toBe(130);
    expect(data.balance).toBe(2570);
  });
});

// ============================================
// TESTS: GET /api/reports/monthly
// ============================================
describe('GET /api/reports/monthly', () => {
  it('Debe retornar reporte mensual con token válido - 200', async () => {
    const response = await request(app)
      .get(`/api/reports/monthly?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('totalIncome');
    expect(response.body.data).toHaveProperty('totalExpense');
    expect(response.body.data).toHaveProperty('balance');
    expect(response.body.data).toHaveProperty('expensesByCategory');
  });

  it('Debe aceptar parámetro year en query string', async () => {
    const response = await request(app)
      .get(`/api/reports/monthly?year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('Debe aceptar parámetro month en query string', async () => {
    const response = await request(app)
      .get(`/api/reports/monthly?month=3`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('Debe retornar 401 sin token de autenticación', async () => {
    const response = await request(app)
      .get('/api/reports/monthly')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  it('Debe calcular correctamente datos del mes específico', async () => {
    const response = await request(app)
      .get(`/api/reports/monthly?month=4&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.totalIncome).toBe(2700); // 2500 + 200
    expect(data.totalExpense).toBe(130); // 35 + 40 + 55
    expect(data.balance).toBe(2570);
  });

  it('Debe retornar datos vacíos si no hay transacciones en el mes', async () => {
    const response = await request(app)
      .get(`/api/reports/monthly?month=12&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.totalIncome).toBe(0);
    expect(data.totalExpense).toBe(0);
    expect(data.balance).toBe(0);
  });
});

// ============================================
// TESTS: GET /api/reports/yearly
// ============================================
describe('GET /api/reports/yearly', () => {
  it('Debe retornar reporte anual con token válido - 200', async () => {
    const response = await request(app)
      .get(`/api/reports/yearly?year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('year');
    expect(response.body.data).toHaveProperty('months');
    expect(response.body.data).toHaveProperty('totals');
  });

  it('Debe retornar array de 12 meses', async () => {
    const response = await request(app)
      .get(`/api/reports/yearly?year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.months).toBeInstanceOf(Array);
    expect(data.months.length).toBe(12);
  });

  it('Debe incluir estructura correcta para cada mes', async () => {
    const response = await request(app)
      .get(`/api/reports/yearly?year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    data.months.forEach((month) => {
      expect(month).toHaveProperty('month');
      expect(month).toHaveProperty('income');
      expect(month).toHaveProperty('expense');
      expect(month).toHaveProperty('balance');
      expect(month.income).toBeGreaterThanOrEqual(0);
      expect(month.expense).toBeGreaterThanOrEqual(0);
    });
  });

  it('Debe calcular correctamente los totales anuales', async () => {
    const response = await request(app)
      .get(`/api/reports/yearly?year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    const { totals } = data;

    // Total ingresos: (2500+300) + 2700 = 5500
    expect(totals.totalIncome).toBe(5500);

    // Total gastos: 230.50 + 130 = 360.50
    expect(totals.totalExpense).toBe(360.50);

    // Balance: 5500 - 360.50 = 5139.50
    expect(totals.balance).toBe(5139.50);
  });

  it('Debe datos correctos para mes con transacciones', async () => {
    const response = await request(app)
      .get(`/api/reports/yearly?year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    const mayo = data.months[4]; // Mayo es el mes 5

    expect(mayo.month).toBe(5);
    expect(mayo.income).toBe(2800);
    expect(mayo.expense).toBe(230.50);
    expect(mayo.balance).toBe(2569.50);
  });

  it('Debe retornar 401 sin token de autenticación', async () => {
    const response = await request(app)
      .get('/api/reports/yearly')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });
});

// ============================================
// TESTS: GET /api/reports/category-breakdown
// ============================================
describe('GET /api/reports/category-breakdown', () => {
  it('Debe retornar desglose por categoría - 200', async () => {
    const response = await request(app)
      .get(`/api/reports/category-breakdown?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('Debe incluir estructura correcta de categorías', async () => {
    const response = await request(app)
      .get(`/api/reports/category-breakdown?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    data.forEach((category) => {
      expect(category).toHaveProperty('categoryId');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('amount');
      expect(category).toHaveProperty('color');
      expect(category).toHaveProperty('percentage');
    });
  });

  it('Debe agrupar correctamente gastos por categoría', async () => {
    const response = await request(app)
      .get(`/api/reports/category-breakdown?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    const foodCategory = data.find((cat) => cat.name === 'Alimentación');

    // Alimentación: 45.50 + 25 + 80 = 150.50
    expect(foodCategory).toBeDefined();
    expect(foodCategory.amount).toBe(150.50);
  });

  it('Debe calcular percentajes correctamente en desglose', async () => {
    const response = await request(app)
      .get(`/api/reports/category-breakdown?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    const totalExpense = data.reduce((sum, cat) => sum + cat.amount, 0);

    data.forEach((category) => {
      const expectedPercentage = (category.amount / totalExpense) * 100;
      expect(Math.round(category.percentage * 100) / 100).toBeCloseTo(expectedPercentage, 1);
    });
  });

  it('Debe retornar 401 sin token de autenticación', async () => {
    const response = await request(app)
      .get('/api/reports/category-breakdown')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  it('Debe retornar datos vacíos si no hay categorías en el mes', async () => {
    const response = await request(app)
      .get(`/api/reports/category-breakdown?month=12&year=${currentYear}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBe(0);
  });
});

// ============================================
// TESTS: GET /api/reports/filters
// ============================================
describe('GET /api/reports/filters', () => {
  it('Debe retornar filtros disponibles - 200', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
  });

  it('Debe incluir años disponibles', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data).toHaveProperty('years');
    expect(data.years).toBeInstanceOf(Array);
    expect(data.years.length).toBeGreaterThan(0);
  });

  it('Debe incluir meses por año', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data).toHaveProperty('monthsByYear');
    expect(typeof data.monthsByYear).toBe('object');
  });

  it('Debe incluir sugerencias de filtros', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data).toHaveProperty('suggestedYear');
    expect(data).toHaveProperty('suggestedMonth');
    expect(data).toHaveProperty('hasData');
  });

  it('Debe indicar si hay datos disponibles', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.hasData).toBe(true);
  });

  it('Debe retornar 401 sin token de autenticación', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  it('Debe incluir el año actual en los años disponibles', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.years).toContain(currentYear);
  });

  it('Debe retornar meses válidos (1-12) para cada año', async () => {
    const response = await request(app)
      .get('/api/reports/filters')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    const data = response.body.data;
    Object.entries(data.monthsByYear).forEach(([year, months]) => {
      months.forEach((month) => {
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
      });
    });
  });
});

// ============================================
// TESTS: VALIDACIONES Y EDGE CASES
// ============================================
describe('Reportes - Validaciones y Edge Cases', () => {
  it('Debe manejar parámetros de mes inválidos gracefully', async () => {
    const response = await request(app)
      .get('/api/reports/summary?month=13')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });

  it('Debe manejar parámetros de año inválidos gracefully', async () => {
    const response = await request(app)
      .get('/api/reports/summary?year=9999')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });

  it('Debe retornar formato de respuesta consistente en todos los endpoints', async () => {
    const endpoints = [
      '/api/reports/summary',
      `/api/reports/monthly`,
      `/api/reports/yearly`,
      '/api/reports/category-breakdown',
      '/api/reports/filters',
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    }
  });

  it('Debe permitir acceso solo a datos del usuario autenticado', async () => {
    // Crear otro usuario
    const anotherUserEmail = generateRandomEmail();
    await insertTestUser({
      name: 'Another User',
      email: anotherUserEmail,
      password: 'AnotherPassword123!',
    });

    const anotherUserLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: anotherUserEmail,
        password: 'AnotherPassword123!',
      });

    const anotherUserToken = anotherUserLogin.body.data.token;

    // El otro usuario no debe ver los datos del primer usuario
    const response = await request(app)
      .get(`/api/reports/summary?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.totalIncome).toBe(0);
    expect(data.totalExpense).toBe(0);
  });
});
