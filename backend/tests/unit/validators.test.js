import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
} from '../../src/validators/authValidator.js';
import {
  validateAmount,
  validateDate,
  validateCategory,
} from '../../src/validators/expenseValidator.js';
import { validateCategoryName } from '../../src/validators/categoryValidator.js';

describe('Validators', () => {
  // ==================== authValidator ====================
  describe('authValidator.validateEmail', () => {
    it('debe validar un email válido', () => {
      expect(validateEmail('usuario@example.com')).toBe(true);
      expect(validateEmail('test.email@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('debe rechazar emails inválidos', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('usuario @example.com')).toBe(false);
      expect(validateEmail('user@example')).toBe(false);
    });

    it('debe rechazar valores null y undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });

    it('debe rechazar strings vacíos', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('   ')).toBe(false);
    });

    it('debe rechazar valores no string', () => {
      expect(validateEmail(123)).toBe(false);
      expect(validateEmail({})).toBe(false);
      expect(validateEmail([])).toBe(false);
    });

    it('debe manejar emails con espacios al inicio/final', () => {
      expect(validateEmail('  usuario@example.com  ')).toBe(true);
    });
  });

  describe('authValidator.validatePassword', () => {
    it('debe validar contraseñas válidas', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('secure@Pass123')).toBe(true);
      expect(validatePassword('12345678')).toBe(true); // Exactamente 8 caracteres
      expect(validatePassword('very_long_password_with_special_chars!@#$%')).toBe(true);
    });

    it('debe rechazar contraseñas con menos de 8 caracteres', () => {
      expect(validatePassword('pass123')).toBe(false);
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('a')).toBe(false);
      expect(validatePassword('1234567')).toBe(false);
    });

    it('debe rechazar valores null y undefined', () => {
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });

    it('debe rechazar strings vacíos', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('   ')).toBe(false);
    });

    it('debe rechazar valores no string', () => {
      expect(validatePassword(123)).toBe(false);
      expect(validatePassword({})).toBe(false);
      expect(validatePassword([])).toBe(false);
    });

    it('debe aceptar contraseñas con caracteres especiales', () => {
      expect(validatePassword('P@ssw0rd!')).toBe(true);
      expect(validatePassword('Contraseña123')).toBe(true);
    });
  });

  // ==================== expenseValidator ====================
  describe('expenseValidator.validateAmount', () => {
    it('debe validar montos válidos', () => {
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(0.01)).toBe(true);
      expect(validateAmount(9999.99)).toBe(true);
      expect(validateAmount('50.25')).toBe(true); // string convertible a número
      expect(validateAmount('150')).toBe(true);
    });

    it('debe rechazar montos cero o negativos', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
      expect(validateAmount('-50.5')).toBe(false);
    });

    it('debe rechazar valores null y undefined', () => {
      expect(validateAmount(null)).toBe(false);
      expect(validateAmount(undefined)).toBe(false);
    });

    it('debe rechazar NaN', () => {
      expect(validateAmount(NaN)).toBe(false);
      expect(validateAmount('abc')).toBe(false);
      expect(validateAmount('123abc')).toBe(false);
    });

    it('debe rechazar strings vacíos', () => {
      expect(validateAmount('')).toBe(false);
      expect(validateAmount('   ')).toBe(false);
    });

    it('debe rechazar valores muy grandes', () => {
      expect(validateAmount(Infinity)).toBe(false);
      expect(validateAmount(-Infinity)).toBe(false);
    });
  });

  describe('expenseValidator.validateDate', () => {
    it('debe validar fechas en formato ISO 8601', () => {
      expect(validateDate('2024-05-03')).toBe(true);
      expect(validateDate('2024-05-03T10:30:00')).toBe(true);
      expect(validateDate('2024-05-03T10:30:00Z')).toBe(true);
      expect(validateDate('2024-12-31')).toBe(true);
    });

    it('debe rechazar formatos de fecha inválidos', () => {
      expect(validateDate('03/05/2024')).toBe(false);
      expect(validateDate('2024-13-01')).toBe(false); // mes inválido
      expect(validateDate('2024-05-32')).toBe(false); // día inválido
      expect(validateDate('invalid-date')).toBe(false);
      expect(validateDate('2024/05/03')).toBe(false);
    });

    it('debe rechazar valores null y undefined', () => {
      expect(validateDate(null)).toBe(false);
      expect(validateDate(undefined)).toBe(false);
    });

    it('debe rechazar strings vacíos', () => {
      expect(validateDate('')).toBe(false);
      expect(validateDate('   ')).toBe(false);
    });

    it('debe rechazar valores no string', () => {
      expect(validateDate(123)).toBe(false);
      expect(validateDate({})).toBe(false);
      expect(validateDate(new Date())).toBe(false);
    });

    it('debe validar fechas límite', () => {
      expect(validateDate('2024-01-01')).toBe(true);
      expect(validateDate('2024-12-31')).toBe(true);
    });
  });

  describe('expenseValidator.validateCategory', () => {
    const validCategories = ['Comida', 'Transporte', 'Entretenimiento', 'Salud'];

    it('debe validar categorías en la lista', () => {
      expect(validateCategory('Comida', validCategories)).toBe(true);
      expect(validateCategory('Transporte', validCategories)).toBe(true);
      expect(validateCategory('Salud', validCategories)).toBe(true);
    });

    it('debe rechazar categorías no en la lista', () => {
      expect(validateCategory('Ropa', validCategories)).toBe(false);
      expect(validateCategory('Vivienda', validCategories)).toBe(false);
      expect(validateCategory('XYZ', validCategories)).toBe(false);
    });

    it('debe rechazar valores null y undefined', () => {
      expect(validateCategory(null, validCategories)).toBe(false);
      expect(validateCategory(undefined, validCategories)).toBe(false);
    });

    it('debe rechazar strings vacíos', () => {
      expect(validateCategory('', validCategories)).toBe(false);
      expect(validateCategory('   ', validCategories)).toBe(false);
    });

    it('debe rechazar valores no string', () => {
      expect(validateCategory(123, validCategories)).toBe(false);
      expect(validateCategory({}, validCategories)).toBe(false);
    });

    it('debe ser sensible a mayúsculas/minúsculas', () => {
      expect(validateCategory('comida', validCategories)).toBe(false);
      expect(validateCategory('COMIDA', validCategories)).toBe(false);
    });

    it('debe rechazar si validCategories no es un array', () => {
      expect(validateCategory('Comida', null)).toBe(false);
      expect(validateCategory('Comida', undefined)).toBe(false);
      expect(validateCategory('Comida', 'Comida')).toBe(false);
    });

    it('debe trabajar con array vacío', () => {
      expect(validateCategory('Comida', [])).toBe(false);
    });
  });

  // ==================== categoryValidator ====================
  describe('categoryValidator.validateCategoryName', () => {
    it('debe validar nombres válidos', () => {
      expect(validateCategoryName('Comida')).toBe(true);
      expect(validateCategoryName('Transporte')).toBe(true);
      expect(validateCategoryName('A')).toBe(true); // Un carácter
      expect(validateCategoryName('Categoría con espacios')).toBe(true);
      expect(validateCategoryName('123')).toBe(true);
    });

    it('debe rechazar nombres vacíos', () => {
      expect(validateCategoryName('')).toBe(false);
      expect(validateCategoryName('   ')).toBe(false);
    });

    it('debe rechazar nombres mayores a 50 caracteres', () => {
      const longName = 'A'.repeat(51);
      expect(validateCategoryName(longName)).toBe(false);
    });

    it('debe aceptar nombres de exactamente 50 caracteres', () => {
      const maxName = 'A'.repeat(50);
      expect(validateCategoryName(maxName)).toBe(true);
    });

    it('debe rechazar valores null y undefined', () => {
      expect(validateCategoryName(null)).toBe(false);
      expect(validateCategoryName(undefined)).toBe(false);
    });

    it('debe rechazar valores no string', () => {
      expect(validateCategoryName(123)).toBe(false);
      expect(validateCategoryName({})).toBe(false);
      expect(validateCategoryName([])).toBe(false);
    });

    it('debe manejar nombres con espacios al inicio/final', () => {
      expect(validateCategoryName('  Comida  ')).toBe(true);
    });

    it('debe rechazar solo espacios', () => {
      expect(validateCategoryName('     ')).toBe(false);
    });
  });
});
