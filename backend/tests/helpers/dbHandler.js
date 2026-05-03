/**
 * Database Handler - Utilidades para manejo de BD en tests
 * Funciones para limpiar, insertar y consultar datos en tests
 */

import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import Expense from '../../src/models/Expense.js';
import Income from '../../src/models/Income.js';
import Budget from '../../src/models/Budget.js';
import { hashPassword } from '../../src/utils/authUtils.js';

/**
 * Limpia colecciones específicas de la BD
 * @param {string|string[]} collections - Nombre(s) de colección(es) a limpiar
 * @returns {Promise<void>}
 */
export const clearCollections = async (collections = []) => {
  if (typeof collections === 'string') {
    collections = [collections];
  }

  const mongooseCollections = mongoose.connection.collections;

  if (collections.length === 0) {
    // Si no se especifican colecciones, limpia todas
    for (const key in mongooseCollections) {
      await mongooseCollections[key].deleteMany({});
    }
  } else {
    // Limpia solo las colecciones especificadas
    for (const collectionName of collections) {
      const collection = mongooseCollections[collectionName];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  }
};

/**
 * Inserta un usuario de prueba en la BD
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado con ID
 */
export const insertTestUser = async (userData = {}) => {
  const defaultData = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  const mergedData = { ...defaultData, ...userData };
  const hashedPassword = await hashPassword(mergedData.password);

  const user = new User({
    ...mergedData,
    password: hashedPassword
  });

  return user.save();
};

/**
 * Inserta múltiples usuarios de prueba
 * @param {Array<Object>} usersData - Array de datos de usuarios
 * @returns {Promise<Array>} Array de usuarios creados
 */
export const insertTestUsers = async (usersData = []) => {
  const users = [];

  for (const userData of usersData) {
    const user = await insertTestUser(userData);
    users.push(user);
  }

  return users;
};

/**
 * Inserta una categoría de prueba
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada con ID
 */
export const insertTestCategory = async (categoryData = {}) => {
  const defaultData = {
    name: 'Test Category',
    type: 'expense',
    color: '#007bff',
    icon: '📌'
  };

  const mergedData = { ...defaultData, ...categoryData };
  const category = new Category(mergedData);

  return category.save();
};

/**
 * Inserta múltiples categorías de prueba
 * @param {Array<Object>} categoriesData - Array de datos de categorías
 * @returns {Promise<Array>} Array de categorías creadas
 */
export const insertTestCategories = async (categoriesData = []) => {
  const categories = [];

  for (const categoryData of categoriesData) {
    const category = await insertTestCategory(categoryData);
    categories.push(category);
  }

  return categories;
};

/**
 * Inserta un gasto de prueba
 * @param {Object} expenseData - Datos del gasto
 * @returns {Promise<Object>} Gasto creado con ID
 */
export const insertTestExpense = async (expenseData = {}) => {
  const defaultData = {
    userId: new mongoose.Types.ObjectId(),
    description: 'Test Expense',
    amount: 50.00,
    category: new mongoose.Types.ObjectId(),
    date: new Date()
  };

  const mergedData = { ...defaultData, ...expenseData };
  const expense = new Expense(mergedData);

  return expense.save();
};

/**
 * Inserta múltiples gastos de prueba
 * @param {Array<Object>} expensesData - Array de datos de gastos
 * @returns {Promise<Array>} Array de gastos creados
 */
export const insertTestExpenses = async (expensesData = []) => {
  const expenses = [];

  for (const expenseData of expensesData) {
    const expense = await insertTestExpense(expenseData);
    expenses.push(expense);
  }

  return expenses;
};

/**
 * Inserta un ingreso de prueba
 * @param {Object} incomeData - Datos del ingreso
 * @returns {Promise<Object>} Ingreso creado con ID
 */
export const insertTestIncome = async (incomeData = {}) => {
  const defaultData = {
    userId: new mongoose.Types.ObjectId(),
    description: 'Test Income',
    amount: 2500.00,
    category: new mongoose.Types.ObjectId(),
    date: new Date()
  };

  const mergedData = { ...defaultData, ...incomeData };
  const income = new Income(mergedData);

  return income.save();
};

/**
 * Inserta múltiples ingresos de prueba
 * @param {Array<Object>} incomesData - Array de datos de ingresos
 * @returns {Promise<Array>} Array de ingresos creados
 */
export const insertTestIncomes = async (incomesData = []) => {
  const incomes = [];

  for (const incomeData of incomesData) {
    const income = await insertTestIncome(incomeData);
    incomes.push(income);
  }

  return incomes;
};

/**
 * Obtiene un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
export const getUserByEmail = async (email) => {
  return User.findOne({ email }).select('+password');
};

/**
 * Obtiene un usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
export const getUserById = async (userId) => {
  return User.findById(userId);
};

/**
 * Verifica si existe un documento en una colección
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} filter - Filtro MongoDB
 * @returns {Promise<boolean>} True si existe, false si no
 */
export const documentExists = async (collectionName, filter = {}) => {
  const mongooseCollections = mongoose.connection.collections;
  const collection = mongooseCollections[collectionName];

  if (!collection) {
    return false;
  }

  const document = await collection.findOne(filter);
  return document !== null;
};

/**
 * Obtiene la cantidad de documentos en una colección
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} filter - Filtro MongoDB (opcional)
 * @returns {Promise<number>} Cantidad de documentos
 */
export const getDocumentCount = async (collectionName, filter = {}) => {
  const mongooseCollections = mongoose.connection.collections;
  const collection = mongooseCollections[collectionName];

  if (!collection) {
    return 0;
  }

  return collection.countDocuments(filter);
};

/**
 * Obtiene un documento de la colección
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} filter - Filtro MongoDB
 * @returns {Promise<Object|null>} Documento encontrado o null
 */
export const getDocument = async (collectionName, filter = {}) => {
  const mongooseCollections = mongoose.connection.collections;
  const collection = mongooseCollections[collectionName];

  if (!collection) {
    return null;
  }

  return collection.findOne(filter);
};

/**
 * Obtiene múltiples documentos de la colección
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} filter - Filtro MongoDB
 * @param {Object} options - Opciones (limit, skip, sort, etc)
 * @returns {Promise<Array>} Array de documentos
 */
export const getDocuments = async (collectionName, filter = {}, options = {}) => {
  const mongooseCollections = mongoose.connection.collections;
  const collection = mongooseCollections[collectionName];

  if (!collection) {
    return [];
  }

  let query = collection.find(filter);

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.skip) {
    query = query.skip(options.skip);
  }

  if (options.sort) {
    query = query.sort(options.sort);
  }

  return query.toArray();
};

/**
 * Limpia todas las colecciones
 * Útil para reset completo entre tests
 * @returns {Promise<void>}
 */
export const clearAllCollections = async () => {
  await clearCollections();
};
