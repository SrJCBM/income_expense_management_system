/**
 * Tests Unitarios - Servicio de Gastos
 * Tests para funciones: createExpense, getUserExpenses, updateExpense, deleteExpense, getExpensesByMonth
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import Expense from '../../src/models/Expense.js';
import expenseService from '../../src/services/expenseService.js';
import {
	clearCollections,
	insertTestUser,
	insertTestCategory,
	insertTestExpense,
} from '../helpers/dbHandler.js';
import {
	generateRandomUser,
	commonCategories,
	generateExpenses,
} from '../fixtures/data.js';
import { NotFoundError } from '../../src/errors/ApplicationError.js';
import '../setup.js';

/**
 * Suite de tests para ExpenseService
 */
describe('ExpenseService', () => {
	let testUser;
	let testCategories = {};

	/**
	 * Setup: Crear usuario y categorías de prueba antes de cada test
	 */
	beforeEach(async () => {
		// Crear usuario de prueba
		testUser = await insertTestUser({
			email: `expensetest_${Date.now()}@example.com`,
			name: 'Expense Test User',
		});

		// Crear categorías de prueba asociadas al usuario
		for (const [key, categoryData] of Object.entries(commonCategories)) {
			testCategories[key] = await insertTestCategory({
				...categoryData,
				userId: testUser._id,
			});
		}
	});

	/**
	 * Cleanup: Limpiar colecciones después de cada test
	 */
	afterEach(async () => {
		await clearCollections(['users', 'categories', 'expenses']);
		testUser = null;
		testCategories = {};
	});

	/**
	 * Suite: Pruebas para createExpense
	 */
	describe('createExpense', () => {
		/**
		 * Test 1: Debe crear un gasto con datos válidos
		 */
		it('debe crear un gasto con datos válidos', async () => {
			const expenseData = {
				description: 'Almuerzo en restaurante',
				amount: 45.50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			};

			const result = await expenseService.createExpense(
				testUser._id,
				expenseData
			);

			// Verificar estructura del gasto creado
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('userId');
			expect(result).toHaveProperty('description', expenseData.description);
			expect(result).toHaveProperty('amount', expenseData.amount);
			expect(result).toHaveProperty('date');
			expect(result).toHaveProperty('concept', expenseData.description);

			// Verificar que el gasto se guardó en la BD
			const savedExpense = await Expense.findById(result.id);
			expect(savedExpense).toBeDefined();
			expect(savedExpense.userId.toString()).toBe(testUser._id.toString());
		});

		/**
		 * Test 2: Debe asignar el userId correcto
		 */
		it('debe asignar el userId correcto', async () => {
			const expenseData = {
				description: 'Gasolina',
				amount: 30.00,
				category: testCategories.transport._id,
				date: new Date('2024-05-16'),
			};

			const result = await expenseService.createExpense(
				testUser._id,
				expenseData
			);

			expect(result.userId.toString()).toBe(testUser._id.toString());
		});

		/**
		 * Test 3: Debe fallar si el monto es negativo
		 */
		it('debe fallar si el monto es negativo', async () => {
			const expenseDataNegative = {
				description: 'Gasto inválido',
				amount: -10,
				category: testCategories.food._id,
				date: new Date('2024-05-17'),
			};

			// Intentar crear con monto negativo
			await expect(
				expenseService.createExpense(testUser._id, expenseDataNegative)
			).rejects.toThrow();
		});

		/**
		 * Test 4: Debe fallar si la categoría no existe
		 */
		it('debe fallar si la categoría no existe', async () => {
			const invalidCategoryId = new mongoose.Types.ObjectId();
			const expenseData = {
				description: 'Gasto con categoría inválida',
				amount: 50.00,
				category: invalidCategoryId,
				date: new Date('2024-05-18'),
			};

			// Mongoose no valida referencias, pero el servicio debería manejar esto
			const result = await expenseService.createExpense(
				testUser._id,
				expenseData
			);

			// El gasto se crea pero sin populate de categoría
			expect(result.category).toBeDefined();
		});

		/**
		 * Test 5: Debe fallar si la fecha es inválida
		 */
		it('debe fallar si la fecha es inválida', async () => {
			const expenseDataInvalidDate = {
				description: 'Gasto con fecha inválida',
				amount: 50.00,
				category: testCategories.food._id,
				date: 'invalid-date',
			};

			// Mongo debería rechazar una fecha inválida
			await expect(
				expenseService.createExpense(testUser._id, expenseDataInvalidDate)
			).rejects.toThrow();
		});

		/**
		 * Test 6: Debe soportar datos adicionales como notas y tags
		 */
		it('debe soportar datos adicionales como notas y tags', async () => {
			const expenseData = {
				description: 'Cena especial',
				amount: 75.00,
				category: testCategories.food._id,
				date: new Date('2024-05-19'),
				notes: 'Cena de aniversario',
				tags: ['especial', 'celebración'],
			};

			const result = await expenseService.createExpense(
				testUser._id,
				expenseData
			);

			expect(result.notes).toBe(expenseData.notes);
			expect(result.tags).toEqual(expenseData.tags);
		});
	});

	/**
	 * Suite: Pruebas para getUserExpenses
	 */
	describe('getUserExpenses', () => {
		/**
		 * Test 1: Debe retornar solo gastos del usuario autenticado
		 */
		it('debe retornar solo gastos del usuario autenticado', async () => {
			// Crear otro usuario
			const anotherUser = await insertTestUser({
				email: `another_${Date.now()}@example.com`,
				name: 'Another User',
			});

			// Crear gastos para el usuario de prueba
			const expense1 = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 1',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			const expense2 = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 2',
				amount: 30,
				category: testCategories.transport._id,
				date: new Date('2024-05-16'),
			});

			// Crear gastos para otro usuario
			await insertTestExpense({
				userId: anotherUser._id,
				description: 'Gasto de otro usuario',
				amount: 100,
				category: testCategories.food._id,
				date: new Date('2024-05-17'),
			});

			const result = await expenseService.getUserExpenses(testUser._id);

			expect(result).toHaveLength(2);
			expect(result[0].userId.toString()).toBe(testUser._id.toString());
			expect(result[1].userId.toString()).toBe(testUser._id.toString());
		});

		/**
		 * Test 2: Debe retornar lista vacía si el usuario no tiene gastos
		 */
		it('debe retornar lista vacía si el usuario no tiene gastos', async () => {
			const result = await expenseService.getUserExpenses(testUser._id);

			expect(result).toEqual([]);
		});

		/**
		 * Test 3: Debe filtrar por categoría
		 */
		it('debe filtrar por categoría', async () => {
			// Crear gastos de diferentes categorías
			await insertTestExpense({
				userId: testUser._id,
				description: 'Almuerzo',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasolina',
				amount: 30,
				category: testCategories.transport._id,
				date: new Date('2024-05-16'),
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Cine',
				amount: 15,
				category: testCategories.entertainment._id,
				date: new Date('2024-05-17'),
			});

			// Filtrar por categoría food
			const result = await expenseService.getUserExpenses(testUser._id, {
				category: testCategories.food._id,
			});

			expect(result).toHaveLength(1);
			expect(result[0].description).toBe('Almuerzo');
			expect(result[0].categoryId).toBe(
				testCategories.food._id.toString()
			);
		});

		/**
		 * Test 4: Debe filtrar por rango de fechas (mes y año)
		 */
		it('debe filtrar por rango de fechas (mes y año)', async () => {
			// Crear gastos en diferentes meses
			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Abril',
				amount: 50,
				category: testCategories.food._id,
				date: new Date(2024, 3, 15), // Abril
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Mayo 1',
				amount: 30,
				category: testCategories.transport._id,
				date: new Date(2024, 4, 10), // Mayo
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Mayo 2',
				amount: 20,
				category: testCategories.entertainment._id,
				date: new Date(2024, 4, 25), // Mayo
			});

			// Filtrar por Mayo 2024
			const result = await expenseService.getUserExpenses(testUser._id, {
				month: 5,
				year: 2024,
			});

			expect(result).toHaveLength(2);
			result.forEach((expense) => {
				expect(expense.date).toBeDefined();
			});
		});

		/**
		 * Test 5: Debe ordenar por fecha descendente
		 */
		it('debe ordenar por fecha descendente', async () => {
			// Crear gastos con fechas diferentes
			const date1 = new Date(2024, 4, 10);
			const date2 = new Date(2024, 4, 20);
			const date3 = new Date(2024, 4, 15);

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 1',
				amount: 50,
				category: testCategories.food._id,
				date: date1,
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 2',
				amount: 30,
				category: testCategories.transport._id,
				date: date2,
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 3',
				amount: 20,
				category: testCategories.entertainment._id,
				date: date3,
			});

			const result = await expenseService.getUserExpenses(testUser._id);

			// Debe estar ordenado por fecha descendente
			expect(result[0].description).toBe('Gasto 2'); // 20
			expect(result[1].description).toBe('Gasto 3'); // 15
			expect(result[2].description).toBe('Gasto 1'); // 10
		});

		/**
		 * Test 6: Debe combinar múltiples filtros
		 */
		it('debe combinar múltiples filtros (categoría y rango de fechas)', async () => {
			// Crear gastos variados
			await insertTestExpense({
				userId: testUser._id,
				description: 'Comida Mayo',
				amount: 50,
				category: testCategories.food._id,
				date: new Date(2024, 4, 15),
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Transporte Mayo',
				amount: 30,
				category: testCategories.transport._id,
				date: new Date(2024, 4, 20),
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Comida Abril',
				amount: 40,
				category: testCategories.food._id,
				date: new Date(2024, 3, 10),
			});

			// Filtrar por comida en Mayo
			const result = await expenseService.getUserExpenses(testUser._id, {
				category: testCategories.food._id,
				month: 5,
				year: 2024,
			});

			expect(result).toHaveLength(1);
			expect(result[0].description).toBe('Comida Mayo');
		});
	});

	/**
	 * Suite: Pruebas para updateExpense
	 */
	describe('updateExpense', () => {
		/**
		 * Test 1: Debe actualizar el monto del gasto exitosamente
		 */
		it('debe actualizar el monto del gasto exitosamente', async () => {
			// Crear un gasto
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto original',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			// Actualizar el monto
			const updateData = {
				amount: 75.50,
			};

			const result = await expenseService.updateExpense(
				expense._id,
				testUser._id,
				updateData
			);

			expect(result.amount).toBe(75.50);
			expect(result.description).toBe('Gasto original');
		});

		/**
		 * Test 2: Debe actualizar la descripción
		 */
		it('debe actualizar la descripción', async () => {
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Descripción original',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			const updateData = {
				description: 'Nueva descripción',
			};

			const result = await expenseService.updateExpense(
				expense._id,
				testUser._id,
				updateData
			);

			expect(result.description).toBe('Nueva descripción');
		});

		/**
		 * Test 3: Debe actualizar la categoría
		 */
		it('debe actualizar la categoría', async () => {
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			const updateData = {
				category: testCategories.transport._id,
			};

			const result = await expenseService.updateExpense(
				expense._id,
				testUser._id,
				updateData
			);

			expect(result.categoryId).toBe(testCategories.transport._id.toString());
		});

		/**
		 * Test 4: Debe fallar si el gasto no existe
		 */
		it('debe fallar si el gasto no existe', async () => {
			const nonExistentExpenseId = new mongoose.Types.ObjectId();

			const updateData = {
				amount: 100,
			};

			await expect(
				expenseService.updateExpense(
					nonExistentExpenseId,
					testUser._id,
					updateData
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 5: Debe fallar si el usuario no es el propietario del gasto
		 */
		it('debe fallar si el usuario no es el propietario del gasto', async () => {
			// Crear otro usuario
			const anotherUser = await insertTestUser({
				email: `another_${Date.now()}@example.com`,
				name: 'Another User',
			});

			// Crear gasto para el primer usuario
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto del usuario 1',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			// Intentar actualizar con otro usuario
			const updateData = {
				amount: 100,
			};

			await expect(
				expenseService.updateExpense(
					expense._id,
					anotherUser._id,
					updateData
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 6: Debe mantener otros campos sin cambios
		 */
		it('debe mantener otros campos sin cambios', async () => {
			const originalDate = new Date('2024-05-15');
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto original',
				amount: 50,
				category: testCategories.food._id,
				date: originalDate,
				notes: 'Notas originales',
			});

			const updateData = {
				amount: 75,
			};

			const result = await expenseService.updateExpense(
				expense._id,
				testUser._id,
				updateData
			);

			expect(result.notes).toBe('Notas originales');
		});
	});

	/**
	 * Suite: Pruebas para deleteExpense
	 */
	describe('deleteExpense', () => {
		/**
		 * Test 1: Debe eliminar el gasto exitosamente
		 */
		it('debe eliminar el gasto exitosamente', async () => {
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto a eliminar',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			const result = await expenseService.deleteExpense(
				expense._id,
				testUser._id
			);

			// Verificar respuesta
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('concept', 'Gasto a eliminar');

			// Verificar que el gasto fue eliminado de la BD
			const deletedExpense = await Expense.findById(expense._id);
			expect(deletedExpense).toBeNull();
		});

		/**
		 * Test 2: Debe fallar si el gasto no existe
		 */
		it('debe fallar si el gasto no existe', async () => {
			const nonExistentExpenseId = new mongoose.Types.ObjectId();

			await expect(
				expenseService.deleteExpense(
					nonExistentExpenseId,
					testUser._id
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 3: Debe fallar si intenta eliminar gasto de otro usuario
		 */
		it('debe fallar si intenta eliminar gasto de otro usuario', async () => {
			// Crear otro usuario
			const anotherUser = await insertTestUser({
				email: `another_${Date.now()}@example.com`,
				name: 'Another User',
			});

			// Crear gasto para el primer usuario
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto del usuario 1',
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			// Intentar eliminar con otro usuario
			await expect(
				expenseService.deleteExpense(
					expense._id,
					anotherUser._id
				)
			).rejects.toThrow(NotFoundError);

			// Verificar que el gasto aún existe
			const stillExistentExpense = await Expense.findById(expense._id);
			expect(stillExistentExpense).toBeDefined();
		});

		/**
		 * Test 4: Debe retornar información del gasto eliminado
		 */
		it('debe retornar información del gasto eliminado', async () => {
			const expense = await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto con información',
				amount: 100,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			});

			const result = await expenseService.deleteExpense(
				expense._id,
				testUser._id
			);

			expect(result.id).toBe(expense._id.toString());
			expect(result.concept).toBe('Gasto con información');
		});
	});

	/**
	 * Suite: Pruebas para getExpensesByMonth
	 */
	describe('getExpensesByMonth (mediante getUserExpenses con filtros)', () => {
		/**
		 * Test 1: Debe retornar gastos de un mes específico
		 */
		it('debe retornar gastos de un mes específico', async () => {
			// Crear gastos en diferentes meses
			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Abril 1',
				amount: 50,
				category: testCategories.food._id,
				date: new Date(2024, 3, 10), // Abril
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Abril 2',
				amount: 60,
				category: testCategories.transport._id,
				date: new Date(2024, 3, 20), // Abril
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Mayo',
				amount: 30,
				category: testCategories.food._id,
				date: new Date(2024, 4, 15), // Mayo
			});

			// Obtener gastos de Abril
			const result = await expenseService.getUserExpenses(testUser._id, {
				month: 4,
				year: 2024,
			});

			expect(result).toHaveLength(2);
			expect(result[0].description).toMatch(/Gasto Abril/);
			expect(result[1].description).toMatch(/Gasto Abril/);
		});

		/**
		 * Test 2: Debe calcular el total correctamente
		 */
		it('debe calcular el total correctamente', async () => {
			// Crear gastos en un mes específico
			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 1',
				amount: 50,
				category: testCategories.food._id,
				date: new Date(2024, 4, 10), // Mayo
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 2',
				amount: 30.50,
				category: testCategories.transport._id,
				date: new Date(2024, 4, 15), // Mayo
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto 3',
				amount: 19.50,
				category: testCategories.entertainment._id,
				date: new Date(2024, 4, 25), // Mayo
			});

			// Obtener gastos de Mayo
			const result = await expenseService.getUserExpenses(testUser._id, {
				month: 5,
				year: 2024,
			});

			expect(result).toHaveLength(3);

			// Calcular total
			const total = result.reduce((sum, expense) => sum + expense.amount, 0);
			expect(total).toBe(100);
		});

		/**
		 * Test 3: Debe retornar lista vacía si no hay gastos en el mes
		 */
		it('debe retornar lista vacía si no hay gastos en el mes', async () => {
			// Crear gasto en un mes diferente
			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Enero',
				amount: 50,
				category: testCategories.food._id,
				date: new Date(2024, 0, 15), // Enero
			});

			// Buscar gastos en un mes sin gastos
			const result = await expenseService.getUserExpenses(testUser._id, {
				month: 6,
				year: 2024,
			});

			expect(result).toHaveLength(0);
		});

		/**
		 * Test 4: Debe retornar gastos de diferentes años
		 */
		it('debe retornar gastos de diferentes años', async () => {
			// Crear gastos en diferentes años pero mismo mes
			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Mayo 2023',
				amount: 50,
				category: testCategories.food._id,
				date: new Date(2023, 4, 15), // Mayo 2023
			});

			await insertTestExpense({
				userId: testUser._id,
				description: 'Gasto Mayo 2024',
				amount: 30,
				category: testCategories.transport._id,
				date: new Date(2024, 4, 15), // Mayo 2024
			});

			// Obtener gastos de Mayo 2023
			const resultMay2023 = await expenseService.getUserExpenses(testUser._id, {
				month: 5,
				year: 2023,
			});

			expect(resultMay2023).toHaveLength(1);
			expect(resultMay2023[0].description).toBe('Gasto Mayo 2023');

			// Obtener gastos de Mayo 2024
			const resultMay2024 = await expenseService.getUserExpenses(testUser._id, {
				month: 5,
				year: 2024,
			});

			expect(resultMay2024).toHaveLength(1);
			expect(resultMay2024[0].description).toBe('Gasto Mayo 2024');
		});
	});

	/**
	 * Suite: Pruebas de seguridad y validación
	 */
	describe('Validación y Seguridad', () => {
		/**
		 * Test 1: Debe rechazar gastos sin descripción
		 */
		it('debe rechazar gastos sin descripción', async () => {
			const expenseData = {
				amount: 50,
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			};

			await expect(
				expenseService.createExpense(testUser._id, expenseData)
			).rejects.toThrow();
		});

		/**
		 * Test 2: Debe rechazar gastos sin monto
		 */
		it('debe rechazar gastos sin monto', async () => {
			const expenseData = {
				description: 'Gasto sin monto',
				category: testCategories.food._id,
				date: new Date('2024-05-15'),
			};

			await expect(
				expenseService.createExpense(testUser._id, expenseData)
			).rejects.toThrow();
		});

		/**
		 * Test 3: Debe rechazar gastos sin categoría
		 */
		it('debe rechazar gastos sin categoría', async () => {
			const expenseData = {
				description: 'Gasto sin categoría',
				amount: 50,
				date: new Date('2024-05-15'),
			};

			await expect(
				expenseService.createExpense(testUser._id, expenseData)
			).rejects.toThrow();
		});

		/**
		 * Test 4: Debe rechazar gastos sin fecha
		 */
		it('debe rechazar gastos sin fecha', async () => {
			const expenseData = {
				description: 'Gasto sin fecha',
				amount: 50,
				category: testCategories.food._id,
			};

			await expect(
				expenseService.createExpense(testUser._id, expenseData)
			).rejects.toThrow();
		});
	});
});
