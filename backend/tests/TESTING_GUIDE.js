/**
 * GUÍA DE USO - Test Fixtures y Helpers
 * 
 * Este archivo documenta cómo usar los fixtures y helpers creados para tests con Vitest
 */

/**
 * ============================================
 * 1. USAR FIXTURES (tests/fixtures/data.js)
 * ============================================
 */

// Importar los fixtures
import {
  testUser,
  testExpense,
  testIncome,
  commonCategories,
  generateRandomEmail,
  generateRandomUser,
  generateExpenses,
  generateIncomes
} from './fixtures/data.js';

// Ejemplo: Usar un usuario por defecto
const user = testUser;
console.log(user.email); // 'test@example.com'

// Ejemplo: Generar un email único cada vez
const uniqueEmail = generateRandomEmail();
console.log(uniqueEmail); // 'test_1714660800000_1234@example.com'

// Ejemplo: Generar usuario aleatorio
const randomUser = generateRandomUser();
console.log(randomUser.name); // 'Alice Johnson' o similar

// Ejemplo: Generar usuario con sobrescrituras
const customUser = generateRandomUser({
  name: 'Mi Usuario',
  password: 'MiPassword123!'
});

// Ejemplo: Generar múltiples gastos
const expenses = generateExpenses(5);
expenses.forEach(exp => console.log(exp.amount));

// Ejemplo: Categorías comunes
Object.entries(commonCategories).forEach(([key, cat]) => {
  console.log(`${key}: ${cat.name} (${cat.icon})`);
});

/**
 * ============================================
 * 2. USAR DB HANDLER (tests/helpers/dbHandler.js)
 * ============================================
 */

import {
  clearCollections,
  insertTestUser,
  insertTestUsers,
  insertTestCategory,
  insertTestCategories,
  insertTestExpense,
  insertTestExpenses,
  insertTestIncome,
  insertTestIncomes,
  getUserByEmail,
  getUserById,
  documentExists,
  getDocumentCount,
  getDocument,
  getDocuments
} from './helpers/dbHandler.js';

// Ejemplo: Test simple con limpieza
describe('User Tests', () => {
  beforeEach(async () => {
    // Limpia todas las colecciones antes de cada test
    await clearCollections();
  });

  it('debe crear un usuario', async () => {
    const user = await insertTestUser({
      email: 'newuser@example.com',
      name: 'New User'
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe('newuser@example.com');
  });

  it('debe obtener usuario por email', async () => {
    await insertTestUser({
      email: 'finder@example.com',
      name: 'Finder'
    });

    const found = await getUserByEmail('finder@example.com');
    expect(found).toBeDefined();
    expect(found.email).toBe('finder@example.com');
  });

  it('debe insertar múltiples usuarios', async () => {
    const users = await insertTestUsers([
      { email: 'user1@example.com', name: 'User 1' },
      { email: 'user2@example.com', name: 'User 2' }
    ]);

    expect(users).toHaveLength(2);
    const count = await getDocumentCount('users');
    expect(count).toBe(2);
  });

  it('debe verificar si existe documento', async () => {
    await insertTestUser({ email: 'exists@example.com' });

    const exists = await documentExists('users', { email: 'exists@example.com' });
    expect(exists).toBe(true);

    const notExists = await documentExists('users', { email: 'notfound@example.com' });
    expect(notExists).toBe(false);
  });

  it('debe limpiar solo ciertos colecciones', async () => {
    // Limpia solo usuarios y categorías
    await insertTestUser();
    await insertTestCategory({ userId: 'anyId' });

    await clearCollections(['users', 'categories']);

    const userCount = await getDocumentCount('users');
    expect(userCount).toBe(0);
  });
});

/**
 * ============================================
 * 3. USAR TEST UTILS (tests/helpers/testUtils.js)
 * ============================================
 */

import {
  createTestToken,
  createExpiredToken,
  createInvalidToken,
  createAuthHeaders,
  createAuthenticatedRequest,
  waitFor,
  sleep,
  withTimeout,
  nextTick,
  createMockResponse,
  createMockRequest,
  generateObjectId,
  isValidObjectId,
  createTestContext,
  deepEqualIgnoring,
  retry
} from './helpers/testUtils.js';

// Ejemplo: Tests de autenticación
describe('Auth Tests', () => {
  it('debe crear token válido', () => {
    const token = createTestToken({
      userId: '507f1f77bcf86cd799439011',
      email: 'user@example.com'
    });

    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3); // JWT tiene 3 partes
  });

  it('debe crear token expirado', () => {
    const token = createExpiredToken();
    expect(token).toBeDefined();
    // El token estará expirado cuando se valide
  });

  it('debe crear headers con autorización', () => {
    const token = createTestToken();
    const headers = createAuthHeaders({}, token);

    expect(headers['Authorization']).toMatch(/^Bearer /);
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('debe crear request autenticado', () => {
    const req = createAuthenticatedRequest(
      { amount: 50, description: 'Test' },
      'POST'
    );

    expect(req.headers['Authorization']).toBeDefined();
    expect(req.body.amount).toBe(50);
    expect(req.userId).toBeDefined();
  });

  it('debe crear contexto de test completo', () => {
    const ctx = createTestContext();

    expect(ctx.userId).toBeDefined();
    expect(ctx.token).toBeDefined();
    expect(ctx.headers['Authorization']).toBeDefined();
  });
});

// Ejemplo: Tests con esperas
describe('Async Tests', () => {
  it('debe esperar condición con waitFor', async () => {
    let counter = 0;

    // Simula operación que tarda
    setTimeout(() => {
      counter = 5;
    }, 200);

    const success = await waitFor(
      () => counter === 5,
      { maxAttempts: 10, delay: 50 }
    );

    expect(success).toBe(true);
  });

  it('debe ejecutar con timeout', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => resolve('done'), 1000);
    });

    const result = await withTimeout(promise, 5000);
    expect(result).toBe('done');
  });

  it('debe reintentar operación', async () => {
    let attempts = 0;

    const result = await retry(
      async () => {
        attempts++;
        if (attempts < 3) throw new Error('Intento fallido');
        return 'éxito';
      },
      { maxAttempts: 5, delay: 100 }
    );

    expect(result).toBe('éxito');
    expect(attempts).toBe(3);
  });
});

// Ejemplo: Tests con mocks
describe('Mock Tests', () => {
  it('debe simular request y response', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { email: 'test@example.com' },
      user: { _id: generateObjectId() }
    });

    const res = createMockResponse();

    // Simular handler
    res.status(201).json({ success: true });

    expect(res.statusCode).toBe(201);
    expect(res.sentData.success).toBe(true);
  });

  it('debe validar ObjectId', () => {
    const validId = generateObjectId();
    const invalidId = 'not-an-id';

    expect(isValidObjectId(validId)).toBe(true);
    expect(isValidObjectId(invalidId)).toBe(false);
  });

  it('debe comparar objetos ignorando campos', () => {
    const obj1 = {
      name: 'Test',
      email: 'test@example.com',
      _id: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02')
    };

    const obj2 = {
      name: 'Test',
      email: 'test@example.com',
      _id: '2',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-02')
    };

    const equal = deepEqualIgnoring(obj1, obj2);
    expect(equal).toBe(true);
  });
});

/**
 * ============================================
 * 4. EJEMPLO COMPLETO: Test de Controlador
 * ============================================
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Expense Controller Tests', () => {
  beforeEach(async () => {
    await clearCollections();
  });

  it('debe crear un gasto', async () => {
    // 1. Crear usuario y categoría
    const user = await insertTestUser();
    const category = await insertTestCategory({ userId: user._id });

    // 2. Crear contexto de test
    const ctx = createTestContext({ userId: user._id.toString() });

    // 3. Simular request autenticado
    const expenseData = {
      amount: 100,
      description: 'Test expense',
      category: category._id.toString(),
      date: new Date()
    };

    // 4. Crear expense
    const expense = await insertTestExpense({
      ...expenseData,
      userId: user._id
    });

    // 5. Validar
    expect(expense._id).toBeDefined();
    expect(expense.amount).toBe(100);

    // 6. Verificar en BD
    const count = await getDocumentCount('expenses');
    expect(count).toBe(1);
  });

  it('debe actualizar gasto con reintentos', async () => {
    const user = await insertTestUser();
    const category = await insertTestCategory({ userId: user._id });
    const expense = await insertTestExpense({
      userId: user._id,
      category: category._id
    });

    // Usa retry para operación que podría fallar
    const updated = await retry(
      async () => {
        expense.amount = 150;
        return expense.save();
      },
      { maxAttempts: 3, delay: 50 }
    );

    expect(updated.amount).toBe(150);
  });
});

/**
 * ============================================
 * 5. RESUMEN DE FUNCIONES PRINCIPALES
 * ============================================
 */

/**
 * FIXTURES (data.js):
 * - testUser, testExpense, testIncome: Datos por defecto
 * - generateRandomEmail(): Email único
 * - generateRandomUser(): Usuario aleatorio
 * - generateExpenses(count): Múltiples gastos
 * - generateIncomes(count): Múltiples ingresos
 * - commonCategories: Categorías predefinidas
 * 
 * DB HANDLER (dbHandler.js):
 * - clearCollections(names): Limpia BD
 * - insertTestUser(data): Inserta usuario
 * - insertTestCategory(data): Inserta categoría
 * - insertTestExpense(data): Inserta gasto
 * - insertTestIncome(data): Inserta ingreso
 * - getUserByEmail(email): Obtiene usuario
 * - documentExists(collection, filter): Verifica existencia
 * - getDocumentCount(collection): Cuenta documentos
 * 
 * TEST UTILS (testUtils.js):
 * - createTestToken(payload): Token JWT
 * - createAuthHeaders(headers, token): Headers con auth
 * - createAuthenticatedRequest(body, method): Request simulado
 * - waitFor(condition, options): Espera condición
 * - sleep(ms): Pausa
 * - withTimeout(promise, ms): Promise con timeout
 * - retry(fn, options): Reintentar operación
 * - createMockResponse(): Response simulado
 * - createMockRequest(overrides): Request simulado
 * - createTestContext(): Contexto completo
 * - deepEqualIgnoring(obj1, obj2): Comparación sin timestamps
 */
