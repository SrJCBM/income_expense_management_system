/**
 * Tests Unitarios - Servicio de Categorías
 * Tests para funciones: createCategory, getUserCategories, getCategoryById, updateCategory, deleteCategory
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import Expense from '../../src/models/Expense.js';
import Income from '../../src/models/Income.js';
import categoryService from '../../src/services/categoryService.js';
import {
	clearCollections,
	insertTestUser,
	insertTestCategory,
	insertTestExpense,
	insertTestIncome,
} from '../helpers/dbHandler.js';
import {
	commonCategories,
} from '../fixtures/data.js';
import { ConflictError, NotFoundError, ValidationError } from '../../src/errors/ApplicationError.js';
import '../setup.js';

/**
 * Suite de tests para CategoryService
 */
describe('CategoryService', () => {
	let testUser;
	let testUser2;
	let testCategories = {};

	/**
	 * Setup: Crear usuarios y categorías de prueba antes de cada test
	 */
	beforeEach(async () => {
		// Crear primer usuario de prueba
		testUser = await insertTestUser({
			email: `categorytest_${Date.now()}@example.com`,
			name: 'Category Test User',
		});

		// Crear segundo usuario de prueba para tests de independencia
		testUser2 = await insertTestUser({
			email: `categorytest2_${Date.now()}@example.com`,
			name: 'Category Test User 2',
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
		await clearCollections(['users', 'categories', 'expenses', 'incomes']);
		testUser = null;
		testUser2 = null;
		testCategories = {};
	});

	/**
	 * Suite: Pruebas para createCategory
	 */
	describe('createCategory', () => {
		/**
		 * Test 1: Debe crear una categoría personalizada con datos válidos
		 */
		it('debe crear una categoría personalizada con datos válidos', async () => {
			const categoryData = {
				name: 'Categoría Personalizada',
				type: 'expense',
				color: '#ff0000',
				icon: '🎯',
				description: 'Una categoría de prueba personalizada'
			};

			const result = await categoryService.createCategory(
				testUser._id,
				categoryData
			);

			// Verificar estructura de la categoría creada
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('name', categoryData.name);
			expect(result).toHaveProperty('type', categoryData.type);
			expect(result).toHaveProperty('color', categoryData.color);
			expect(result).toHaveProperty('icon', categoryData.icon);
			expect(result).toHaveProperty('description', categoryData.description);

			// Verificar que la categoría se guardó en la BD
			const savedCategory = await Category.findById(result.id);
			expect(savedCategory).toBeDefined();
			expect(savedCategory.userId.toString()).toBe(testUser._id.toString());
			expect(savedCategory.name).toBe(categoryData.name);
		});

		/**
		 * Test 2: Debe permitir crear categoría sin color e ícono (valores opcionales)
		 */
		it('debe crear una categoría aunque falten color e ícono (valores undefined)', async () => {
			const categoryData = {
				name: 'Categoría Sin Color',
				type: 'income',
				description: 'Una categoría sin color específico'
			};

			const result = await categoryService.createCategory(
				testUser._id,
				categoryData
			);

			// El servicio permite undefined para color e ícono
			expect(result).toHaveProperty('name', categoryData.name);
			expect(result).toHaveProperty('type', 'income');
			// Simplemente verificar que se creó y tiene el ID
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('description', categoryData.description);
		});

		/**
		 * Test 3: Debe fallar si el nombre de categoría ya existe para ese usuario y tipo
		 */
		it('debe fallar si el nombre ya existe para ese usuario y tipo', async () => {
			const categoryData = {
				name: 'Categoría Duplicada',
				type: 'expense',
				color: '#123456',
				icon: '📌'
			};

			// Crear primera categoría
			await categoryService.createCategory(testUser._id, categoryData);

			// Intentar crear una categoría con el mismo nombre y tipo
			await expect(
				categoryService.createCategory(testUser._id, categoryData)
			).rejects.toThrow(ConflictError);
		});

		/**
		 * Test 4: Debe diferenciar categorías por tipo (expense vs income)
		 */
		it('debe permitir mismo nombre para tipos diferentes', async () => {
			const categoryName = 'Múltiple';

			// Crear categoría expense
			const expenseCategory = await categoryService.createCategory(
				testUser._id,
				{
					name: categoryName,
					type: 'expense',
					color: '#ff0000',
					icon: '💸'
				}
			);

			// Crear categoría income con el mismo nombre
			const incomeCategory = await categoryService.createCategory(
				testUser._id,
				{
					name: categoryName,
					type: 'income',
					color: '#00ff00',
					icon: '💰'
				}
			);

			expect(expenseCategory.type).toBe('expense');
			expect(incomeCategory.type).toBe('income');
			expect(expenseCategory.id).not.toBe(incomeCategory.id);
		});

		/**
		 * Test 5: Debe fallar si el tipo no es válido
		 */
		it('debe fallar si el tipo no es "expense" o "income"', async () => {
			const invalidTypes = ['shopping', 'transfer', 'savings', ''];

			for (const invalidType of invalidTypes) {
				await expect(
					categoryService.createCategory(testUser._id, {
						name: 'Categoría Inválida',
						type: invalidType,
						color: '#000000'
					})
				).rejects.toThrow(ValidationError);
			}
		});

		/**
		 * Test 6: Debe fallar si el nombre está vacío o es whitespace
		 */
		it('debe fallar si el nombre es vacío o solo espacios', async () => {
			const emptyNames = ['', '   ', null];

			for (const emptyName of emptyNames) {
				await expect(
					categoryService.createCategory(testUser._id, {
						name: emptyName,
						type: 'expense',
						color: '#000000'
					})
				).rejects.toThrow(ValidationError);
			}
		});

		/**
		 * Test 7: Debe normalizar espacios en blanco del nombre
		 */
		it('debe normalizar espacios en blanco en el nombre', async () => {
			const result = await categoryService.createCategory(
				testUser._id,
				{
					name: '  Categoría  Con  Espacios  ',
					type: 'expense',
					color: '#000000'
				}
			);

			expect(result.name).toBe('Categoría  Con  Espacios');
		});

		/**
		 * Test 8: Debe ser case-insensitive para detectar duplicados
		 */
		it('debe detectar duplicados sin importar mayúsculas/minúsculas', async () => {
			await categoryService.createCategory(testUser._id, {
				name: 'Mi Categoría',
				type: 'expense'
			});

			await expect(
				categoryService.createCategory(testUser._id, {
					name: 'mi categoría',
					type: 'expense'
				})
			).rejects.toThrow(ConflictError);
		});
	});

	/**
	 * Suite: Pruebas para getUserCategories (getCategories)
	 */
	describe('getUserCategories', () => {
		/**
		 * Test 1: Debe retornar todas las categorías del usuario
		 */
		it('debe retornar todas las categorías del usuario', async () => {
			const result = await categoryService.getUserCategories(testUser._id);

			// Debe incluir las categorías creadas en beforeEach
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			// Verificar que incluye las categorías predefinidas + personalizadas
			const categoryNames = result.map(c => c.name);
			expect(categoryNames).toContain('Alimentación');
			expect(categoryNames).toContain('Transporte');
		});

		/**
		 * Test 2: Debe retornar categorías predefinidas del sistema
		 */
		it('debe retornar categorías predefinidas para nuevos usuarios', async () => {
			const newUser = await insertTestUser({
				email: `newuser_${Date.now()}@example.com`,
				name: 'New User'
			});

			const result = await categoryService.getUserCategories(newUser._id);

			const categoryNames = result.map(c => c.name);

			// Verificar categorías predefinidas de expense
			expect(categoryNames).toContain('Alimentación');
			expect(categoryNames).toContain('Transporte');
			expect(categoryNames).toContain('Vivienda');
			expect(categoryNames).toContain('Salud');
			expect(categoryNames).toContain('Educación');
			expect(categoryNames).toContain('Entretenimiento');
			expect(categoryNames).toContain('Servicios');
			expect(categoryNames).toContain('Otros Gastos');

			// Verificar categorías predefinidas de income
			expect(categoryNames).toContain('Salario');
			expect(categoryNames).toContain('Freelance');
			expect(categoryNames).toContain('Ventas');
			expect(categoryNames).toContain('Inversiones');
			expect(categoryNames).toContain('Otros Ingresos');
		});

		/**
		 * Test 3: Debe filtrar categorías por tipo "expense"
		 */
		it('debe filtrar categorías por tipo "expense"', async () => {
			const result = await categoryService.getUserCategories(testUser._id, {
				type: 'expense'
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			// Todas las categorías deben ser de tipo expense
			result.forEach(category => {
				expect(category.type).toBe('expense');
			});

			// Debe incluir las categorías predefinidas de expense
			const names = result.map(c => c.name);
			expect(names).toContain('Alimentación');
			expect(names).toContain('Transporte');
		});

		/**
		 * Test 4: Debe filtrar categorías por tipo "income"
		 */
		it('debe filtrar categorías por tipo "income"', async () => {
			const result = await categoryService.getUserCategories(testUser._id, {
				type: 'income'
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			// Todas las categorías deben ser de tipo income
			result.forEach(category => {
				expect(category.type).toBe('income');
			});

			// Debe incluir las categorías predefinidas de income
			const names = result.map(c => c.name);
			expect(names).toContain('Salario');
			expect(names).toContain('Freelance');
		});

		/**
		 * Test 5: Debe retornar categorías ordenadas por tipo y nombre
		 */
		it('debe retornar categorías ordenadas por tipo y nombre', async () => {
			const result = await categoryService.getUserCategories(testUser._id);

			// Verificar que están ordenadas por tipo primero, luego por nombre
			for (let i = 0; i < result.length - 1; i++) {
				const current = result[i];
				const next = result[i + 1];

				if (current.type === next.type) {
					expect(current.name.localeCompare(next.name)).toBeLessThanOrEqual(0);
				}
			}
		});

		/**
		 * Test 6: Debe incluir tanto categorías predefinidas como personalizadas
		 */
		it('debe incluir categorías predefinidas y personalizadas', async () => {
			// Crear una categoría personalizada
			const personalData = {
				name: 'Categoría Personal Test',
				type: 'expense',
				color: '#abcdef'
			};

			await categoryService.createCategory(testUser._id, personalData);

			const result = await categoryService.getUserCategories(testUser._id, {
				type: 'expense'
			});

			const names = result.map(c => c.name);

			// Debe incluir tanto predefinidas como personalizadas
			expect(names).toContain('Alimentación'); // Predefinida
			expect(names).toContain('Categoría Personal Test'); // Personalizada
		});

		/**
		 * Test 7: Usuarios diferentes tienen categorías independientes
		 */
		it('usuarios diferentes tienen categorías completamente independientes', async () => {
			// Crear categoría para primer usuario
			await categoryService.createCategory(testUser._id, {
				name: 'Categoría User 1',
				type: 'expense'
			});

			// Obtener categorías de ambos usuarios
			const result1 = await categoryService.getUserCategories(testUser._id, {
				type: 'expense'
			});
			const result2 = await categoryService.getUserCategories(testUser2._id, {
				type: 'expense'
			});

			const names1 = result1.map(c => c.name);
			const names2 = result2.map(c => c.name);

			// User 1 debe tener su categoría personal
			expect(names1).toContain('Categoría User 1');

			// User 2 NO debe tener la categoría personal de User 1
			expect(names2).not.toContain('Categoría User 1');

			// Ambos deben tener las categorías predefinidas
			expect(names1).toContain('Alimentación');
			expect(names2).toContain('Alimentación');
		});

		/**
		 * Test 8: Debe fallar si el tipo de filtro no es válido
		 */
		it('debe fallar si el tipo de filtro no es válido', async () => {
			await expect(
				categoryService.getUserCategories(testUser._id, { type: 'invalid' })
			).rejects.toThrow(ValidationError);
		});

		/**
		 * Test 9: Debe crear categorías predefinidas incluso para usuario nuevo
		 */
		it('debe crear categorías predefinidas incluso para usuario nuevo', async () => {
			const newUser = await insertTestUser({
				email: `brandnew_${Date.now()}@example.com`,
				name: 'Brand New User'
			});

			const result = await categoryService.getUserCategories(newUser._id);

			// Debe haber creado las categorías predefinidas
			expect(result.length).toBe(13); // 8 expense + 5 income predefinidas
		});
	});

	/**
	 * Suite: Pruebas para getCategoryById (mediante findById directamente)
	 */
	describe('getCategoryById', () => {
		/**
		 * Test 1: Debe obtener una categoría por ID
		 */
		it('debe obtener una categoría existente por ID', async () => {
			const categoryId = testCategories.food._id;

			const category = await Category.findById(categoryId);

			expect(category).toBeDefined();
			expect(category._id.toString()).toBe(categoryId.toString());
			expect(category.name).toBe(testCategories.food.name);
		});

		/**
		 * Test 2: Debe retornar null para ID inexistente
		 */
		it('debe retornar null para ID inexistente', async () => {
			const invalidId = new mongoose.Types.ObjectId();

			const category = await Category.findById(invalidId);

			expect(category).toBeNull();
		});

		/**
		 * Test 3: Debe verificar que pertenece al usuario correcto
		 */
		it('debe validar que categoría pertenece al usuario correcto', async () => {
			const categoryId = testCategories.food._id;

			// Buscar con usuario correcto
			const category1 = await Category.findOne({
				_id: categoryId,
				userId: testUser._id
			});
			expect(category1).toBeDefined();

			// Buscar con usuario incorrecto
			const category2 = await Category.findOne({
				_id: categoryId,
				userId: testUser2._id
			});
			expect(category2).toBeNull();
		});
	});

	/**
	 * Suite: Pruebas para updateCategory
	 */
	describe('updateCategory', () => {
		/**
		 * Test 1: Debe actualizar nombre de categoría
		 */
		it('debe actualizar el nombre de una categoría', async () => {
			const categoryId = testCategories.food._id;
			const newName = 'Comida y Bebidas';

			const result = await categoryService.updateCategory(
				categoryId,
				testUser._id,
				{ name: newName }
			);

			expect(result.name).toBe(newName);

			// Verificar en BD
			const updatedCategory = await Category.findById(categoryId);
			expect(updatedCategory.name).toBe(newName);
		});

		/**
		 * Test 2: Debe actualizar color e ícono
		 */
		it('debe actualizar color e ícono de categoría', async () => {
			const categoryId = testCategories.food._id;
			const newColor = '#00ff00';
			const newIcon = '🍕';

			const result = await categoryService.updateCategory(
				categoryId,
				testUser._id,
				{
					color: newColor,
					icon: newIcon
				}
			);

			expect(result.color).toBe(newColor);
			expect(result.icon).toBe(newIcon);

			// Verificar en BD
			const updatedCategory = await Category.findById(categoryId);
			expect(updatedCategory.color).toBe(newColor);
			expect(updatedCategory.icon).toBe(newIcon);
		});

		/**
		 * Test 3: Debe actualizar descripción
		 */
		it('debe actualizar descripción de categoría', async () => {
			const categoryId = testCategories.food._id;
			const newDescription = 'Gastos en alimentos y comidas rápidas';

			const result = await categoryService.updateCategory(
				categoryId,
				testUser._id,
				{ description: newDescription }
			);

			expect(result.description).toBe(newDescription);
		});

		/**
		 * Test 4: Debe fallar si nuevo nombre ya existe para ese usuario y tipo
		 */
		it('debe fallar si nuevo nombre ya existe para ese usuario y tipo', async () => {
			const categoryId = testCategories.food._id;

			// Intentar cambiar a un nombre que ya existe (transport)
			await expect(
				categoryService.updateCategory(
					categoryId,
					testUser._id,
					{ name: 'Transporte' }
				)
			).rejects.toThrow(ConflictError);
		});

		/**
		 * Test 5: Debe permitir mismo nombre si es el mismo ID (actualización)
		 */
		it('debe permitir mantener el mismo nombre en actualización', async () => {
			const categoryId = testCategories.food._id;
			const originalName = testCategories.food.name;

			// Actualizar sin cambiar el nombre
			const result = await categoryService.updateCategory(
				categoryId,
				testUser._id,
				{ color: '#ff0000' }
			);

			expect(result.name).toBe(originalName);
		});

		/**
		 * Test 6: Debe fallar si categoría no existe
		 */
		it('debe fallar si la categoría no existe', async () => {
			const invalidId = new mongoose.Types.ObjectId();

			await expect(
				categoryService.updateCategory(
					invalidId,
					testUser._id,
					{ name: 'Nuevo Nombre' }
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 7: Debe fallar si categoría pertenece a otro usuario
		 */
		it('debe fallar si categoría pertenece a otro usuario', async () => {
			const categoryId = testCategories.food._id;

			await expect(
				categoryService.updateCategory(
					categoryId,
					testUser2._id, // Usuario diferente
					{ name: 'Nuevo Nombre' }
				)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 8: Debe fallar si nuevo nombre es vacío
		 */
		it('debe fallar si nuevo nombre es vacío', async () => {
			const categoryId = testCategories.food._id;

			await expect(
				categoryService.updateCategory(
					categoryId,
					testUser._id,
					{ name: '   ' }
				)
			).rejects.toThrow(ValidationError);
		});

		/**
		 * Test 9: Debe permitir cambiar tipo si el nuevo nombre no existe
		 */
		it('debe permitir cambiar tipo si nuevo nombre no existe para ese tipo', async () => {
			const categoryId = testCategories.food._id;

			const result = await categoryService.updateCategory(
				categoryId,
				testUser._id,
				{
					name: 'Nuevos Ingresos Personalizados',
					type: 'income'
				}
			);

			expect(result.type).toBe('income');
			expect(result.name).toBe('Nuevos Ingresos Personalizados');
		});

		/**
		 * Test 10: Debe fallar al cambiar a tipo inválido
		 */
		it('debe fallar al cambiar a tipo inválido', async () => {
			const categoryId = testCategories.food._id;

			await expect(
				categoryService.updateCategory(
					categoryId,
					testUser._id,
					{ type: 'invalid' }
				)
			).rejects.toThrow(ValidationError);
		});

		/**
		 * Test 11: Debe permitir actualizar solo algunos campos
		 */
		it('debe permitir actualizar solo algunos campos', async () => {
			const categoryId = testCategories.food._id;
			const originalName = testCategories.food.name;
			const originalType = testCategories.food.type;
			const newColor = '#123456';

			const result = await categoryService.updateCategory(
				categoryId,
				testUser._id,
				{ color: newColor }
			);

			expect(result.name).toBe(originalName);
			expect(result.type).toBe(originalType);
			expect(result.color).toBe(newColor);
		});
	});

	/**
	 * Suite: Pruebas para deleteCategory
	 */
	describe('deleteCategory', () => {
		/**
		 * Test 1: Debe eliminar una categoría personalizada sin movimientos
		 */
		it('debe eliminar una categoría personalizada sin movimientos', async () => {
			// Crear una categoría personalizada sin movimientos
			const personalCategory = await categoryService.createCategory(
				testUser._id,
				{
					name: 'Categoría a Eliminar',
					type: 'expense'
				}
			);

			const result = await categoryService.deleteCategory(
				personalCategory.id,
				testUser._id
			);

			expect(result).toHaveProperty('id', personalCategory.id);
			expect(result).toHaveProperty('name', personalCategory.name);

			// Verificar que fue eliminada de BD
			const deletedCategory = await Category.findById(personalCategory.id);
			expect(deletedCategory).toBeNull();
		});

		/**
		 * Test 2: Debe fallar si categoría no existe
		 */
		it('debe fallar si la categoría no existe', async () => {
			const invalidId = new mongoose.Types.ObjectId();

			await expect(
				categoryService.deleteCategory(invalidId, testUser._id)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 3: Debe fallar si categoría pertenece a otro usuario
		 */
		it('debe fallar si categoría pertenece a otro usuario', async () => {
			const categoryId = testCategories.food._id;

			await expect(
				categoryService.deleteCategory(categoryId, testUser2._id)
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 4: Debe fallar si categoría tiene gastos asociados
		 */
		it('debe fallar si categoría tiene gastos asociados', async () => {
			const categoryId = testCategories.food._id;

			// Crear un gasto asociado a la categoría
			await insertTestExpense({
				userId: testUser._id,
				category: categoryId,
				description: 'Gasto de prueba',
				amount: 25.50,
				date: new Date()
			});

			await expect(
				categoryService.deleteCategory(categoryId, testUser._id)
			).rejects.toThrow(ConflictError);
		});

		/**
		 * Test 5: Debe fallar si categoría tiene ingresos asociados
		 */
		it('debe fallar si categoría tiene ingresos asociados', async () => {
			const categoryId = testCategories.salary._id;

			// Crear un ingreso asociado a la categoría
			await insertTestIncome({
				userId: testUser._id,
				category: categoryId,
				description: 'Ingreso de prueba',
				amount: 2500.00,
				date: new Date()
			});

			await expect(
				categoryService.deleteCategory(categoryId, testUser._id)
			).rejects.toThrow(ConflictError);
		});

		/**
		 * Test 6: Debe fallar si categoría tiene múltiples movimientos
		 */
		it('debe fallar si categoría tiene múltiples movimientos', async () => {
			const categoryId = testCategories.food._id;

			// Crear múltiples gastos
			await insertTestExpense({
				userId: testUser._id,
				category: categoryId,
				description: 'Gasto 1',
				amount: 25.50
			});

			await insertTestExpense({
				userId: testUser._id,
				category: categoryId,
				description: 'Gasto 2',
				amount: 30.00
			});

			await expect(
				categoryService.deleteCategory(categoryId, testUser._id)
			).rejects.toThrow(ConflictError);
		});

		/**
		 * Test 7: Debe permitir eliminar categoría si movimientos pertenecen a otro usuario
		 */
		it('debe permitir eliminar categoría si gastos son de otro usuario', async () => {
			// Crear categoría para user 1
			const personalCategory = await categoryService.createCategory(
				testUser._id,
				{
					name: 'Categoría Aislada',
					type: 'expense'
				}
			);

			// Crear gasto para user 2 (que no afecta a user 1)
			await insertTestExpense({
				userId: testUser2._id,
				category: personalCategory.id,
				description: 'Gasto del otro usuario',
				amount: 50.00
			});

			// Debe permitir eliminar para user 1
			const result = await categoryService.deleteCategory(
				personalCategory.id,
				testUser._id
			);

			expect(result).toBeDefined();
			expect(result.id).toBe(personalCategory.id);
		});

		/**
		 * Test 8: Debe poder eliminar categoría después de eliminar sus movimientos
		 */
		it('debe poder eliminar categoría después de eliminar sus movimientos', async () => {
			const categoryId = testCategories.food._id;

			// Crear gasto
			const expense = await insertTestExpense({
				userId: testUser._id,
				category: categoryId,
				description: 'Gasto temporal',
				amount: 25.50
			});

			// Intentar eliminar (debe fallar)
			await expect(
				categoryService.deleteCategory(categoryId, testUser._id)
			).rejects.toThrow(ConflictError);

			// Eliminar el gasto
			await Expense.deleteOne({ _id: expense._id });

			// Ahora debe poder eliminar la categoría
			const result = await categoryService.deleteCategory(
				categoryId,
				testUser._id
			);

			expect(result).toBeDefined();
		});
	});

	/**
	 * Suite: Tests Específicos para Categorías del Sistema
	 */
	describe('Default Categories', () => {
		/**
		 * Test 1: Categorías predefinidas de expense deben existir
		 */
		it('debe crear categorías predefinidas de gastos correctamente', async () => {
			const newUser = await insertTestUser({
				email: `defaulttest_${Date.now()}@example.com`
			});

			const categories = await categoryService.getUserCategories(newUser._id, {
				type: 'expense'
			});

			const categoryNames = categories.map(c => c.name);

			const expectedExpenseCategories = [
				'Alimentación',
				'Transporte',
				'Vivienda',
				'Salud',
				'Educación',
				'Entretenimiento',
				'Servicios',
				'Otros Gastos'
			];

			expectedExpenseCategories.forEach(name => {
				expect(categoryNames).toContain(name);
			});

			expect(categories.length).toBe(8);
		});

		/**
		 * Test 2: Categorías predefinidas de income deben existir
		 */
		it('debe crear categorías predefinidas de ingresos correctamente', async () => {
			const newUser = await insertTestUser({
				email: `incomedefaulttest_${Date.now()}@example.com`
			});

			const categories = await categoryService.getUserCategories(newUser._id, {
				type: 'income'
			});

			const categoryNames = categories.map(c => c.name);

			const expectedIncomeCategories = [
				'Salario',
				'Freelance',
				'Ventas',
				'Inversiones',
				'Otros Ingresos'
			];

			expectedIncomeCategories.forEach(name => {
				expect(categoryNames).toContain(name);
			});

			expect(categories.length).toBe(5);
		});

		/**
		 * Test 3: Categorías predefinidas deben tener iconos
		 */
		it('categorías predefinidas deben tener iconos y colores', async () => {
			const newUser = await insertTestUser({
				email: `icontest_${Date.now()}@example.com`
			});

			const categories = await categoryService.getUserCategories(newUser._id);

			categories.forEach(category => {
				expect(category).toHaveProperty('icon');
				expect(category).toHaveProperty('color');
				expect(typeof category.icon).toBe('string');
				expect(typeof category.color).toBe('string');
				expect(category.icon.length).toBeGreaterThan(0);
				expect(category.color).toMatch(/^#[0-9a-f]{6}$/i);
			});
		});

		/**
		 * Test 4: Categorías predefinidas específicas solicitadas
		 */
		it('debe garantizar existencia de categorías solicitadas (food, transport, salary, freelance)', async () => {
			const newUser = await insertTestUser({
				email: `specifictest_${Date.now()}@example.com`
			});

			const categories = await categoryService.getUserCategories(newUser._id);
			const categoryNames = categories.map(c => c.name);

			// Categorías específicamente solicitadas en el brief
			expect(categoryNames).toContain('Alimentación'); // food
			expect(categoryNames).toContain('Transporte'); // transport
			expect(categoryNames).toContain('Salario'); // salary
			expect(categoryNames).toContain('Freelance'); // freelance
		});

		/**
		 * Test 5: Las categorías predefinidas no se duplican
		 */
		it('las categorías predefinidas no se duplican si se llama múltiples veces', async () => {
			const newUser = await insertTestUser({
				email: `deduplicatetest_${Date.now()}@example.com`
			});

			// Llamar múltiples veces
			const categories1 = await categoryService.getUserCategories(newUser._id);
			const categories2 = await categoryService.getUserCategories(newUser._id);
			const categories3 = await categoryService.getUserCategories(newUser._id);

			// Debe retornar el mismo número de categorías
			expect(categories1.length).toBe(categories2.length);
			expect(categories2.length).toBe(categories3.length);
			expect(categories1.length).toBe(13); // 8 expense + 5 income
		});
	});

	/**
	 * Suite: Tests de Independencia entre Usuarios
	 */
	describe('User Independence', () => {
		/**
		 * Test 1: Cada usuario tiene sus propias categorías personalizadas
		 */
		it('cada usuario tiene categorías personalizadas independientes', async () => {
			// Crear categoría personalizada para user 1
			const user1Category = await categoryService.createCategory(testUser._id, {
				name: 'Mi Categoría Especial',
				type: 'expense'
			});

			// Crear categoría diferente para user 2
			const user2Category = await categoryService.createCategory(testUser2._id, {
				name: 'Categoría Del Otro User',
				type: 'income'
			});

			// Obtener categorías de cada usuario
			const user1Categories = await categoryService.getUserCategories(testUser._id);
			const user2Categories = await categoryService.getUserCategories(testUser2._id);

			const user1Names = user1Categories.map(c => c.name);
			const user2Names = user2Categories.map(c => c.name);

			expect(user1Names).toContain('Mi Categoría Especial');
			expect(user1Names).not.toContain('Categoría Del Otro User');

			expect(user2Names).toContain('Categoría Del Otro User');
			expect(user2Names).not.toContain('Mi Categoría Especial');
		});

		/**
		 * Test 2: No se puede actualizar categoría de otro usuario
		 */
		it('no se puede actualizar categoría de otro usuario', async () => {
			const categoryId = testCategories.food._id;

			await expect(
				categoryService.updateCategory(categoryId, testUser2._id, {
					name: 'Nombre Hackeado'
				})
			).rejects.toThrow(NotFoundError);
		});

		/**
		 * Test 3: No se puede eliminar categoría de otro usuario
		 */
		it('no se puede eliminar categoría de otro usuario', async () => {
			const personalCategory = await categoryService.createCategory(
				testUser._id,
				{
					name: 'Categoría Protegida',
					type: 'expense'
				}
			);

			await expect(
				categoryService.deleteCategory(personalCategory.id, testUser2._id)
			).rejects.toThrow(NotFoundError);

			// Verificar que no fue eliminada
			const stillExists = await Category.findById(personalCategory.id);
			expect(stillExists).toBeDefined();
		});

		/**
		 * Test 4: Ambos usuarios tienen las mismas categorías predefinidas
		 */
		it('ambos usuarios tienen acceso a las mismas categorías predefinidas', async () => {
			const user1Categories = await categoryService.getUserCategories(testUser._id);
			const user2Categories = await categoryService.getUserCategories(testUser2._id);

			const user1DefaultNames = user1Categories
				.filter(c => c.name === 'Alimentación' || c.name === 'Salario')
				.map(c => c.name);

			const user2DefaultNames = user2Categories
				.filter(c => c.name === 'Alimentación' || c.name === 'Salario')
				.map(c => c.name);

			expect(user1DefaultNames).toEqual(user2DefaultNames);
		});
	});
});
