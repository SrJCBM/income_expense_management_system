/**
 * Tests Unitarios - Servicio de Ingresos
 * Tests para funciones: createIncome, getUserIncomes, updateIncome, deleteIncome, getIncomesByMonth
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import Income from '../../src/models/Income.js';
import incomeService from '../../src/services/incomeService.js';
import {
	clearCollections,
	insertTestUser,
	insertTestCategory,
	insertTestIncome,
} from '../helpers/dbHandler.js';
import {
	commonCategories,
} from '../fixtures/data.js';
import { NotFoundError, ValidationError } from '../../src/errors/ApplicationError.js';
import '../setup.js';

/**
 * Suite de tests para IncomeService
 */
describe('IncomeService', () => {
	let testUser;
	let testCategories = {};

	/**
	 * Setup: Crear usuario y categorías de prueba antes de cada test
	 */
	beforeEach(async () => {
		// Crear usuario de prueba
		testUser = await insertTestUser({
			email: `incometest_${Date.now()}@example.com`,
			name: 'Income Test User',
		});

		// Crear categorías de ingresos asociadas al usuario
		for (const [key, categoryData] of Object.entries(commonCategories)) {
			if (categoryData.type === 'income') {
				testCategories[key] = await insertTestCategory({
					...categoryData,
					userId: testUser._id,
				});
			}
		}
	});

	/**
	 * Cleanup: Limpiar colecciones después de cada test
	 */
	afterEach(async () => {
		await clearCollections(['users', 'categories', 'incomes']);
		testUser = null;
		testCategories = {};
	});

	/**
	 * Suite: Pruebas para createIncome
	 */
	describe('createIncome', () => {
		/**
		 * Test 1: Debe crear un ingreso con datos válidos
		 */
		it('debe crear un ingreso con datos válidos', async () => {
			const incomeData = {
				description: 'Salario mensual',
				amount: 2500.00,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			};

			const result = await incomeService.createIncome(
				testUser._id,
				incomeData
			);

			// Verificar estructura del ingreso creado
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('userId');
			expect(result).toHaveProperty('description', incomeData.description);
			expect(result).toHaveProperty('amount', incomeData.amount);
			expect(result).toHaveProperty('date');
			expect(result).toHaveProperty('concept', incomeData.description);

			// Verificar que el ingreso se guardó en la BD
			const savedIncome = await Income.findById(result.id);
			expect(savedIncome).toBeDefined();
			expect(savedIncome.userId.toString()).toBe(testUser._id.toString());
		});

		/**
		 * Test 2: Debe asignar el userId correcto
		 */
		it('debe asignar el userId correcto', async () => {
			const incomeData = {
				description: 'Ingresos por freelance',
				amount: 500.00,
				category: testCategories.freelance._id,
				date: new Date('2024-05-05'),
			};

			const result = await incomeService.createIncome(
				testUser._id,
				incomeData
			);

			expect(result.userId.toString()).toBe(testUser._id.toString());
		});

		/**
		 * Test 3: Debe fallar si el monto es menor o igual a 0
		 */
		it('debe fallar si el monto es menor o igual a 0', async () => {
			const incomeDataNegative = {
				description: 'Ingreso inválido',
				amount: -100,
				category: testCategories.salary._id,
				date: new Date('2024-05-06'),
			};

			// Intentar crear con monto negativo
			await expect(
				incomeService.createIncome(testUser._id, incomeDataNegative)
			).rejects.toThrow();
		});

		/**
		 * Test 4: Debe permitir monto de 0 (validación del modelo)
		 */
		it('debe permitir monto de 0', async () => {
			const incomeDataZero = {
				description: 'Ingreso cero',
				amount: 0,
				category: testCategories.salary._id,
				date: new Date('2024-05-07'),
			};

			// El modelo permite monto 0
			const result = await incomeService.createIncome(
				testUser._id,
				incomeDataZero
			);

			expect(result).toHaveProperty('id');
			expect(result.amount).toBe(0);
		});

		/**
		 * Test 5: Debe validar que la categoría sea de tipo 'income'
		 */
		it('debe fallar si la categoría no es de tipo income', async () => {
			// Crear una categoría de gasto
			const expenseCategory = await insertTestCategory({
				name: 'Alimentación',
				type: 'expense',
				color: '#FF6B6B',
				userId: testUser._id,
			});

			const incomeData = {
				description: 'Ingreso con categoría de gasto',
				amount: 1000.00,
				category: expenseCategory._id,
				date: new Date('2024-05-08'),
			};

			// Debe fallar porque la categoría es de tipo expense, no income
			await expect(
				incomeService.createIncome(testUser._id, incomeData)
			).rejects.toThrow(ValidationError);
		});

		/**
		 * Test 6: Debe fallar si la categoría no existe
		 */
		it('debe fallar si la categoría no existe para el usuario', async () => {
			const invalidCategoryId = new mongoose.Types.ObjectId();
			const incomeData = {
				description: 'Ingreso con categoría inválida',
				amount: 1500.00,
				category: invalidCategoryId,
				date: new Date('2024-05-09'),
			};

			// Debe fallar porque la categoría no existe o no es de tipo income
			await expect(
				incomeService.createIncome(testUser._id, incomeData)
			).rejects.toThrow(ValidationError);
		});

		/**
		 * Test 7: Debe fallar si la fecha es inválida
		 */
		it('debe fallar si la fecha es inválida', async () => {
			const incomeDataInvalidDate = {
				description: 'Ingreso con fecha inválida',
				amount: 2000.00,
				category: testCategories.salary._id,
				date: 'invalid-date',
			};

			// Mongo debería rechazar una fecha inválida
			await expect(
				incomeService.createIncome(testUser._id, incomeDataInvalidDate)
			).rejects.toThrow();
		});

		/**
		 * Test 8: Debe soportar datos adicionales como notas
		 */
		it('debe soportar datos adicionales como notas', async () => {
			const incomeData = {
				description: 'Bono especial',
				amount: 3000.00,
				category: testCategories.salary._id,
				date: new Date('2024-05-10'),
				notes: 'Bono de desempeño',
			};

			const result = await incomeService.createIncome(
				testUser._id,
				incomeData
			);

			expect(result.notes).toBe(incomeData.notes);
		});

		it('debe devolver el ingreso existente al repetir el mismo clientRequestId', async () => {
			const incomeData = {
				description: 'Pago offline',
				amount: 450.25,
				category: testCategories.freelance._id,
				date: new Date('2024-05-12'),
				clientRequestId: 'income-offline-001',
			};

			const firstResult = await incomeService.createIncome(testUser._id, incomeData);
			const secondResult = await incomeService.createIncome(testUser._id, {
				...incomeData,
				description: 'Pago offline duplicado',
				amount: 900,
			});

			const savedIncomes = await Income.find({
				userId: testUser._id,
				clientRequestId: 'income-offline-001',
			});

			expect(secondResult.id).toBe(firstResult.id);
			expect(secondResult.description).toBe('Pago offline');
			expect(secondResult.amount).toBe(450.25);
			expect(savedIncomes).toHaveLength(1);
		});

		/**
		 * Test 9: Debe fallar si no se proporciona categoría
		 */
		it('debe fallar si no se proporciona categoría', async () => {
			const incomeData = {
				description: 'Ingreso sin categoría',
				amount: 500.00,
				date: new Date('2024-05-11'),
			};

			// La categoría es obligatoria en el modelo
			await expect(
				incomeService.createIncome(testUser._id, incomeData)
			).rejects.toThrow();
		});
	});

	/**
	 * Suite: Pruebas para getUserIncomes
	 */
	describe('getUserIncomes', () => {
		/**
		 * Test 1: Debe retornar solo ingresos del usuario autenticado
		 */
		it('debe retornar solo ingresos del usuario autenticado', async () => {
			// Crear otro usuario
			const anotherUser = await insertTestUser({
				email: `another_${Date.now()}@example.com`,
				name: 'Another User',
			});

			// Crear categoría de ingreso para otro usuario
			const anotherUserCategory = await insertTestCategory({
				...commonCategories.salary,
				userId: anotherUser._id,
			});

			// Crear ingresos para el usuario de prueba
			const income1 = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso 1',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			const income2 = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso 2',
				amount: 500,
				category: testCategories.freelance._id,
				date: new Date('2024-05-15'),
			});

			// Crear ingreso para otro usuario
			await insertTestIncome({
				userId: anotherUser._id,
				description: 'Ingreso de otro usuario',
				amount: 3000,
				category: anotherUserCategory._id,
				date: new Date('2024-05-10'),
			});

			const result = await incomeService.getUserIncomes(testUser._id);

			expect(result.data).toHaveLength(2);
			expect(result.data[0].userId.toString()).toBe(testUser._id.toString());
			expect(result.data[1].userId.toString()).toBe(testUser._id.toString());
		});

		/**
		 * Test 2: Debe retornar lista vacía si el usuario no tiene ingresos
		 */
		it('debe retornar lista vacía si el usuario no tiene ingresos', async () => {
			const result = await incomeService.getUserIncomes(testUser._id);

			expect(result.data).toEqual([]);
		});

		/**
		 * Test 3: Debe filtrar por categoría
		 */
		it('debe filtrar por categoría', async () => {
			// Crear ingresos de diferentes categorías
			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario',
				amount: 2500,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Proyecto freelance',
				amount: 800,
				category: testCategories.freelance._id,
				date: new Date('2024-05-10'),
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Otro salario',
				amount: 2500,
				category: testCategories.salary._id,
				date: new Date('2024-05-15'),
			});

			// Filtrar por categoría freelance
			const result = await incomeService.getUserIncomes(testUser._id, {
				category: testCategories.freelance._id,
			});

			expect(result.data).toHaveLength(1);
			expect(result.data[0].description).toBe('Proyecto freelance');
			expect(result.data[0].categoryId).toBe(
				testCategories.freelance._id.toString()
			);
		});

		/**
		 * Test 4: Debe filtrar por rango de fechas (mes y año)
		 */
		it('debe filtrar por rango de fechas (mes y año)', async () => {
			// Crear ingresos en diferentes meses
			await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso Abril',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date(2024, 3, 15), // Abril
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso Mayo 1',
				amount: 2500,
				category: testCategories.salary._id,
				date: new Date(2024, 4, 10), // Mayo
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso Mayo 2',
				amount: 800,
				category: testCategories.freelance._id,
				date: new Date(2024, 4, 25), // Mayo
			});

			// Filtrar por Mayo 2024
			const result = await incomeService.getUserIncomes(testUser._id, {
				month: 5,
				year: 2024,
			});

			expect(result.data).toHaveLength(2);
			result.data.forEach((income) => {
				expect(income.date).toBeDefined();
			});
		});

		/**
		 * Test 5: Debe ordenar por fecha descendente
		 */
		it('debe ordenar por fecha descendente', async () => {
			// Crear ingresos con fechas diferentes
			const date1 = new Date(2024, 4, 10);
			const date2 = new Date(2024, 4, 20);
			const date3 = new Date(2024, 4, 15);

			await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso 1',
				amount: 2000,
				category: testCategories.salary._id,
				date: date1,
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso 2',
				amount: 2500,
				category: testCategories.salary._id,
				date: date2,
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso 3',
				amount: 800,
				category: testCategories.freelance._id,
				date: date3,
			});

			const result = await incomeService.getUserIncomes(testUser._id);

			// Debe estar ordenado por fecha descendente
			expect(result.data[0].description).toBe('Ingreso 2'); // 20
			expect(result.data[1].description).toBe('Ingreso 3'); // 15
			expect(result.data[2].description).toBe('Ingreso 1'); // 10
		});

		/**
		 * Test 6: Debe combinar múltiples filtros (categoría y rango de fechas)
		 */
		it('debe combinar múltiples filtros (categoría y rango de fechas)', async () => {
			// Crear ingresos variados
			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Mayo',
				amount: 2500,
				category: testCategories.salary._id,
				date: new Date(2024, 4, 15),
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Freelance Mayo',
				amount: 800,
				category: testCategories.freelance._id,
				date: new Date(2024, 4, 20),
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Abril',
				amount: 2500,
				category: testCategories.salary._id,
				date: new Date(2024, 3, 10),
			});

			// Filtrar por salario en Mayo
			const result = await incomeService.getUserIncomes(testUser._id, {
				category: testCategories.salary._id,
				month: 5,
				year: 2024,
			});

			expect(result.data).toHaveLength(1);
			expect(result.data[0].description).toBe('Salario Mayo');
		});
	});

	/**
	 * Suite: Pruebas para updateIncome
	 */
	describe('updateIncome', () => {
		/**
		 * Test 1: Debe actualizar el monto del ingreso exitosamente
		 */
		it('debe actualizar el monto del ingreso exitosamente', async () => {
			// Crear un ingreso
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso original',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			// Actualizar el monto
			const updateData = {
				amount: 2500.50,
			};

			const result = await incomeService.updateIncome(
				income._id,
				testUser._id,
				updateData
			);

			expect(result.amount).toBe(2500.50);
			expect(result.description).toBe('Ingreso original');
		});

		/**
		 * Test 2: Debe actualizar la descripción
		 */
		it('debe actualizar la descripción', async () => {
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Descripción original',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			const updateData = {
				description: 'Nueva descripción',
			};

			const result = await incomeService.updateIncome(
				income._id,
				testUser._id,
				updateData
			);

			expect(result.description).toBe('Nueva descripción');
		});

		/**
		 * Test 3: Debe actualizar la categoría a una válida de tipo income
		 */
		it('debe actualizar la categoría a una válida de tipo income', async () => {
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			const updateData = {
				category: testCategories.freelance._id,
			};

			const result = await incomeService.updateIncome(
				income._id,
				testUser._id,
				updateData
			);

			expect(result.categoryId).toBe(testCategories.freelance._id.toString());
		});

		/**
		 * Test 4: Debe fallar si intenta cambiar a categoría de tipo expense
		 */
		it('debe fallar si intenta cambiar a categoría de tipo expense', async () => {
			// Crear categoría de gasto
			const expenseCategory = await insertTestCategory({
				name: 'Alimentación',
				type: 'expense',
				color: '#FF6B6B',
				userId: testUser._id,
			});

			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			const updateData = {
				category: expenseCategory._id,
			};

			// Debe fallar porque intenta cambiar a categoría de tipo expense
			await expect(
				incomeService.updateIncome(
					income._id,
					testUser._id,
					updateData
				)
			).rejects.toThrow(ValidationError);
		});

		/**
		 * Test 5: Debe fallar si el ingreso no existe
		 */
		it('debe fallar si el ingreso no existe', async () => {
			const nonExistentIncomeId = new mongoose.Types.ObjectId();

			const updateData = {
				amount: 3000,
			};

			await expect(
				incomeService.updateIncome(
					nonExistentIncomeId,
					testUser._id,
					updateData
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 6: Debe fallar si el usuario no es el propietario del ingreso
		 */
		it('debe fallar si el usuario no es el propietario del ingreso', async () => {
			// Crear otro usuario
			const anotherUser = await insertTestUser({
				email: `another_${Date.now()}@example.com`,
				name: 'Another User',
			});

			// Crear ingreso para el primer usuario
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso del usuario 1',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			// Intentar actualizar con otro usuario
			const updateData = {
				amount: 3000,
			};

			await expect(
				incomeService.updateIncome(
					income._id,
					anotherUser._id,
					updateData
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 7: Debe mantener otros campos sin cambios
		 */
		it('debe mantener otros campos sin cambios', async () => {
			const originalDate = new Date('2024-05-01');
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso original',
				amount: 2000,
				category: testCategories.salary._id,
				date: originalDate,
				notes: 'Notas originales',
			});

			const updateData = {
				amount: 2500,
			};

			const result = await incomeService.updateIncome(
				income._id,
				testUser._id,
				updateData
			);

			expect(result.notes).toBe('Notas originales');
		});
	});

	/**
	 * Suite: Pruebas para deleteIncome
	 */
	describe('deleteIncome', () => {
		/**
		 * Test 1: Debe eliminar el ingreso exitosamente
		 */
		it('debe eliminar el ingreso exitosamente', async () => {
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso a eliminar',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			const result = await incomeService.deleteIncome(
				income._id,
				testUser._id
			);

			// Verificar respuesta
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('concept', 'Ingreso a eliminar');

			// Verificar que el ingreso fue eliminado de la BD
			const deletedIncome = await Income.findById(income._id);
			expect(deletedIncome).toBeNull();
		});

		/**
		 * Test 2: Debe fallar si el ingreso no existe
		 */
		it('debe fallar si el ingreso no existe', async () => {
			const nonExistentIncomeId = new mongoose.Types.ObjectId();

			await expect(
				incomeService.deleteIncome(
					nonExistentIncomeId,
					testUser._id
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 3: Debe fallar si intenta eliminar ingreso de otro usuario
		 */
		it('debe fallar si intenta eliminar ingreso de otro usuario', async () => {
			// Crear otro usuario
			const anotherUser = await insertTestUser({
				email: `another_${Date.now()}@example.com`,
				name: 'Another User',
			});

			// Crear ingreso para el primer usuario
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso del usuario 1',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			// Intentar eliminar con otro usuario
			await expect(
				incomeService.deleteIncome(
					income._id,
					anotherUser._id
				)
			).rejects.toThrow(NotFoundError);

			// Verificar que el ingreso aún existe
			const stillExistentIncome = await Income.findById(income._id);
			expect(stillExistentIncome).toBeDefined();
		});

		/**
		 * Test 4: Debe retornar información del ingreso eliminado
		 */
		it('debe retornar información del ingreso eliminado', async () => {
			const income = await insertTestIncome({
				userId: testUser._id,
				description: 'Ingreso con información',
				amount: 3000,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			});

			const result = await incomeService.deleteIncome(
				income._id,
				testUser._id
			);

			expect(result.id).toBe(income._id.toString());
			expect(result.concept).toBe('Ingreso con información');
		});
	});

	/**
	 * Suite: Pruebas específicas de ingresos - Categorías de tipo income
	 */
	describe('Validación de categorías de tipo income', () => {
		/**
		 * Test 1: Debe aceptar solo categorías de tipo income
		 */
		it('debe aceptar solo categorías de tipo salary (income)', async () => {
			const incomeData = {
				description: 'Salario mensual',
				amount: 2500.00,
				category: testCategories.salary._id,
				date: new Date('2024-05-01'),
			};

			const result = await incomeService.createIncome(
				testUser._id,
				incomeData
			);

			expect(result).toHaveProperty('id');
			expect(result.categoryId).toBe(testCategories.salary._id.toString());
		});

		/**
		 * Test 2: Debe aceptar categoría freelance como income válida
		 */
		it('debe aceptar categoría freelance como income válida', async () => {
			const incomeData = {
				description: 'Proyecto freelance',
				amount: 800.00,
				category: testCategories.freelance._id,
				date: new Date('2024-05-01'),
			};

			const result = await incomeService.createIncome(
				testUser._id,
				incomeData
			);

			expect(result).toHaveProperty('id');
			expect(result.categoryId).toBe(testCategories.freelance._id.toString());
		});

		/**
		 * Test 3: Debe rechazar categorías de tipo expense
		 */
		it('debe rechazar categorías de tipo expense', async () => {
			// Crear categoría de gasto
			const expenseCategory = await insertTestCategory({
				name: 'Comidas',
				type: 'expense',
				color: '#FF6B6B',
				userId: testUser._id,
			});

			const incomeData = {
				description: 'Intento con categoría de gasto',
				amount: 1000.00,
				category: expenseCategory._id,
				date: new Date('2024-05-01'),
			};

			// Debe fallar
			await expect(
				incomeService.createIncome(testUser._id, incomeData)
			).rejects.toThrow(ValidationError);
		});

		/**
		 * Test 4: Categorías de otro usuario no deben ser válidas
		 */
		it('categorías de otro usuario no deben ser válidas', async () => {
			// Crear otro usuario
			const anotherUser = await insertTestUser({
				email: `another_${Date.now()}@example.com`,
				name: 'Another User',
			});

			// Crear categoría para otro usuario
			const anotherUserCategory = await insertTestCategory({
				name: 'Salario Otro',
				type: 'income',
				color: '#A8E6CF',
				userId: anotherUser._id,
			});

			const incomeData = {
				description: 'Ingreso con categoría de otro usuario',
				amount: 2000.00,
				category: anotherUserCategory._id,
				date: new Date('2024-05-01'),
			};

			// Debe fallar porque la categoría pertenece a otro usuario
			await expect(
				incomeService.createIncome(testUser._id, incomeData)
			).rejects.toThrow(ValidationError);
		});
	});

	/**
	 * Suite: Pruebas para cálculos mensuales de ingresos
	 */
	describe('Cálculos mensuales de ingresos (getIncomesByMonth)', () => {
		/**
		 * Test 1: Debe retornar ingresos de un mes específico
		 */
		it('debe retornar ingresos de un mes específico', async () => {
			// Crear ingresos en diferentes meses
			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Abril 1',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date(2024, 3, 10), // Abril
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Abril 2',
				amount: 500,
				category: testCategories.freelance._id,
				date: new Date(2024, 3, 20), // Abril
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Mayo',
				amount: 2500,
				category: testCategories.salary._id,
				date: new Date(2024, 4, 1), // Mayo
			});

			// Obtener ingresos de Abril
			const aprilIncomes = await incomeService.getUserIncomes(
				testUser._id,
				{ month: 4, year: 2024 }
			);

			expect(aprilIncomes.data).toHaveLength(2);
			expect(aprilIncomes.data[0].description).toMatch(/Abril/);
			expect(aprilIncomes.data[1].description).toMatch(/Abril/);
		});

		/**
		 * Test 2: Debe calcular el total mensual correctamente
		 */
		it('debe calcular el total de ingresos mensual correctamente', async () => {
			const incomesData = [
				{
					description: 'Salario',
					amount: 2500,
					category: testCategories.salary._id,
					date: new Date(2024, 4, 1),
				},
				{
					description: 'Freelance 1',
					amount: 500,
					category: testCategories.freelance._id,
					date: new Date(2024, 4, 15),
				},
				{
					description: 'Freelance 2',
					amount: 300,
					category: testCategories.freelance._id,
					date: new Date(2024, 4, 25),
				},
			];

			// Crear todos los ingresos
			for (const incomeData of incomesData) {
				await insertTestIncome({
					userId: testUser._id,
					...incomeData,
				});
			}

			// Obtener ingresos del mes
			const mayIncomes = await incomeService.getUserIncomes(
				testUser._id,
				{ month: 5, year: 2024 }
			);

			// Calcular total
			const total = mayIncomes.data.reduce((sum, income) => sum + income.amount, 0);

			expect(mayIncomes.data).toHaveLength(3);
			expect(total).toBe(3300); // 2500 + 500 + 300
		});

		/**
		 * Test 3: Debe manejar correctamente meses sin ingresos
		 */
		it('debe manejar correctamente meses sin ingresos', async () => {
			// Crear ingresos solo en Abril
			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Abril',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date(2024, 3, 15), // Abril
			});

			// Consultar un mes sin ingresos
			const novemberIncomes = await incomeService.getUserIncomes(
				testUser._id,
				{ month: 11, year: 2024 }
			);

			expect(novemberIncomes.data).toHaveLength(0);
		});

		/**
		 * Test 4: Debe filtrar por mes sin incluir otros meses
		 */
		it('debe filtrar por mes sin incluir otros meses', async () => {
			// Crear ingresos en Abril y Mayo
			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Abril',
				amount: 2000,
				category: testCategories.salary._id,
				date: new Date(2024, 3, 1), // Abril 1
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Abril Final',
				amount: 500,
				category: testCategories.freelance._id,
				date: new Date(2024, 3, 30), // Abril 30
			});

			await insertTestIncome({
				userId: testUser._id,
				description: 'Salario Mayo',
				amount: 2500,
				category: testCategories.salary._id,
				date: new Date(2024, 4, 1), // Mayo 1
			});

			// Obtener solo ingresos de Abril
			const aprilIncomes = await incomeService.getUserIncomes(
				testUser._id,
				{ month: 4, year: 2024 }
			);

			expect(aprilIncomes.data).toHaveLength(2);
			aprilIncomes.data.forEach((income) => {
				const incomeDate = new Date(income.date);
				expect(incomeDate.getMonth()).toBe(3); // Abril = 3 (0-indexed)
			});
		});
	});
});
