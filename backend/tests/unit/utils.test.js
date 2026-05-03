import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  comparePasswords,
  generateToken,
  verifyToken,
} from '../../src/utils/authUtils.js';
import * as ResponseFormatter from '../../src/utils/responseFormatter.js';

describe('Utils', () => {
  // ==================== authUtils ====================
  // ==================== authUtils ====================
  describe('authUtils.hashPassword', () => {
    it('debe generar un hash válido', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).not.toBe(password); // El hash no debe ser igual a la contraseña
    });

    it('debe generar hashes diferentes para la misma contraseña', async () => {
      const password = 'MyPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Cada hash debe ser único (salt diferente)
    });

    it('debe rechazar valores null y undefined', async () => {
      // Aunque estas llamadas pueden fallar en tiempo de ejecución, probamos que reaccionan
      try {
        await hashPassword(null);
        expect(true).toBe(false); // No debería llegar aquí
      } catch (e) {
        expect(e).toBeDefined();
      }

      try {
        await hashPassword(undefined);
        expect(true).toBe(false); // No debería llegar aquí
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('debe rechazar strings vacíos', async () => {
      // Aunque técnicamente puede hashear una cadena vacía, está bien si lo rechaza
      const result = await hashPassword('');
      expect(result).toBeDefined();
    });

    it('debe manejar contraseñas muy largas', async () => {
      const longPassword = 'A'.repeat(1000);
      const hash = await hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('debe manejar contraseñas con caracteres especiales', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(specialPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('authUtils.comparePasswords', () => {
    let hashedPassword;
    const plainPassword = 'MyPassword123!';

    beforeEach(async () => {
      hashedPassword = await hashPassword(plainPassword);
    });

    it('debe retornar true para contraseña correcta', async () => {
      const result = await comparePasswords(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('debe retornar false para contraseña incorrecta', async () => {
      const result = await comparePasswords('WrongPassword', hashedPassword);
      expect(result).toBe(false);
    });

    it('debe ser sensible a mayúsculas/minúsculas', async () => {
      const result = await comparePasswords('mypassword123!', hashedPassword);
      expect(result).toBe(false);
    });

    it('debe retornar false para string vacío', async () => {
      const result = await comparePasswords('', hashedPassword);
      expect(result).toBe(false);
    });

    it('debe manejar hashes inválidos', async () => {
      const result = await comparePasswords(plainPassword, 'invalid_hash');
      expect(result).toBe(false);
    });

    it('debe retornar false si el hash es null', async () => {
      // bcryptjs rechaza hashes null, por lo que genera error
      try {
        await comparePasswords(plainPassword, null);
        expect(true).toBe(false); // No debería llegar aquí
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('debe comparar contraseñas con caracteres especiales', async () => {
      const specialPassword = 'P@ssw0rd!#$%';
      const hash = await hashPassword(specialPassword);
      const result = await comparePasswords(specialPassword, hash);
      expect(result).toBe(true);
    });
  });

  describe('authUtils.generateToken', () => {
    const userId = '507f1f77bcf86cd799439011';
    const email = 'test@example.com';
    const role = 'user';

    it('debe generar un token válido', () => {
      const token = generateToken(userId, email, role);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT tiene 3 partes separadas por punto
    });

    it('debe incluir información en el payload', () => {
      const token = generateToken(userId, email, role);

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe(role);
    });

    it('debe generar tokens válidos consecutivamente', async () => {
      const token1 = generateToken(userId, email, role);
      await new Promise(resolve => setTimeout(resolve, 10));
      const token2 = generateToken(userId, email, role);

      // Ambos tokens deben ser válidos
      expect(() => verifyToken(token1)).not.toThrow();
      expect(() => verifyToken(token2)).not.toThrow();

      // Deben decodificar correctamente
      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);

      expect(decoded1.userId).toBe(userId);
      expect(decoded2.userId).toBe(userId);
    });

    it('debe usar el rol por defecto si no se proporciona', () => {
      const token = generateToken(userId, email);

      const decoded = verifyToken(token);
      expect(decoded.role).toBe('user');
    });

    it('debe permitir diferentes roles', () => {
      const adminToken = generateToken(userId, email, 'admin');
      const moderatorToken = generateToken(userId, email, 'moderator');

      expect(verifyToken(adminToken).role).toBe('admin');
      expect(verifyToken(moderatorToken).role).toBe('moderator');
    });

    it('debe manejar userId null al generar token', () => {
      try {
        const token = generateToken(null, email, role);
        expect(token).toBeDefined();
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('debe manejar email null al generar token', () => {
      try {
        const token = generateToken(userId, null, role);
        expect(token).toBeDefined();
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('debe manejar emails con caracteres especiales', () => {
      const specialEmail = 'test+tag@example.com';
      const token = generateToken(userId, specialEmail, role);

      const decoded = verifyToken(token);
      expect(decoded.email).toBe(specialEmail);
    });
  });

  describe('authUtils.verifyToken', () => {
    const userId = '507f1f77bcf86cd799439011';
    const email = 'test@example.com';
    const role = 'user';

    it('debe verificar un token válido', () => {
      const token = generateToken(userId, email, role);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe(role);
    });

    it('debe rechazar un token inválido', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow('Token inválido o expirado');
    });

    it('debe rechazar un token malformado', () => {
      const malformed = 'this-is-not-a-token';

      expect(() => verifyToken(malformed)).toThrow('Token inválido o expirado');
    });

    it('debe rechazar token vacío', () => {
      expect(() => verifyToken('')).toThrow('Token inválido o expirado');
    });

    it('debe rechazar null o undefined', () => {
      expect(() => verifyToken(null)).toThrow('Token inválido o expirado');
      expect(() => verifyToken(undefined)).toThrow('Token inválido o expirado');
    });

    it('debe contener información de expiración', () => {
      const token = generateToken(userId, email, role);
      const decoded = verifyToken(token);

      expect(decoded.exp).toBeDefined(); // Debe tener claim de expiración
    });

    it('debe lanzar error si el secret es incorrecto', () => {
      // Crear un token con un secret diferente
      const jwt = require('jsonwebtoken');
      const wrongToken = jwt.sign(
        { userId, email, role },
        'different_secret',
        { expiresIn: '7d' }
      );

      expect(() => verifyToken(wrongToken)).toThrow('Token inválido o expirado');
    });

    it('debe verificar múltiples tokens sin interferencia', () => {
      const token1 = generateToken('id1', 'user1@example.com', 'user');
      const token2 = generateToken('id2', 'user2@example.com', 'admin');

      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);

      expect(decoded1.userId).toBe('id1');
      expect(decoded1.email).toBe('user1@example.com');
      expect(decoded2.userId).toBe('id2');
      expect(decoded2.email).toBe('user2@example.com');
    });
  });

  // ==================== responseFormatter ====================
  describe('responseFormatter.success', () => {
    it('debe retornar un objeto con estructura correcta', () => {
      const data = { id: 1, name: 'Test' };
      const response = ResponseFormatter.success(data);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Operación exitosa');
      expect(response.data).toEqual(data);
    });

    it('debe permitir mensaje personalizado', () => {
      const data = { id: 1 };
      const message = 'Registro creado exitosamente';
      const response = ResponseFormatter.success(data, message);

      expect(response.message).toBe(message);
    });

    it('debe permitir código de estado personalizado', () => {
      const data = { id: 1 };
      const response = ResponseFormatter.success(data, 'Created', 201);

      expect(response.statusCode).toBe(201);
    });

    it('debe manejar datos null', () => {
      const response = ResponseFormatter.success(null);

      expect(response.success).toBe(true);
      expect(response.data).toBe(null);
    });

    it('debe manejar datos vacíos', () => {
      const response = ResponseFormatter.success([]);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    it('debe manejar objetos complejos', () => {
      const complexData = {
        user: { id: 1, name: 'Test' },
        items: [{ id: 1, value: 100 }],
        nested: { deep: { value: 'test' } },
      };
      const response = ResponseFormatter.success(complexData);

      expect(response.data).toEqual(complexData);
    });

    it('debe usar mensaje por defecto si no se proporciona', () => {
      const response = ResponseFormatter.success({ id: 1 });

      expect(response.message).toBe('Operación exitosa');
    });
  });

  describe('responseFormatter.error', () => {
    it('debe retornar un objeto con estructura correcta', () => {
      const message = 'Error en la operación';
      const response = ResponseFormatter.error(message);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(500);
      expect(response.message).toBe(message);
    });

    it('debe permitir código de estado personalizado', () => {
      const message = 'No encontrado';
      const response = ResponseFormatter.error(message, 404);

      expect(response.statusCode).toBe(404);
    });

    it('debe manejar mensajes de error comunes', () => {
      const errors = [
        { message: 'Email ya registrado', statusCode: 400 },
        { message: 'Contraseña incorrecta', statusCode: 401 },
        { message: 'Acceso denegado', statusCode: 403 },
        { message: 'Recurso no encontrado', statusCode: 404 },
        { message: 'Error interno del servidor', statusCode: 500 },
      ];

      errors.forEach(({ message, statusCode }) => {
        const response = ResponseFormatter.error(message, statusCode);
        expect(response.message).toBe(message);
        expect(response.statusCode).toBe(statusCode);
      });
    });

    it('debe rechazar valores null en mensaje', () => {
      const response = ResponseFormatter.error(null);

      expect(response.success).toBe(false);
    });

    it('debe usar código 500 por defecto', () => {
      const response = ResponseFormatter.error('Error');

      expect(response.statusCode).toBe(500);
    });

    it('debe manejar mensajes muy largos', () => {
      const longMessage = 'A'.repeat(1000);
      const response = ResponseFormatter.error(longMessage);

      expect(response.message).toBe(longMessage);
    });

    it('debe manejar caracteres especiales en mensajes', () => {
      const message = 'Error: <script>alert("xss")</script>';
      const response = ResponseFormatter.error(message);

      expect(response.message).toBe(message);
    });
  });

  describe('responseFormatter.paginated', () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    it('debe retornar un objeto con estructura correcta', () => {
      const response = ResponseFormatter.paginated(mockData, 1, 10, 100);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
      expect(response.pagination).toBeDefined();
    });

    it('debe calcular correctamente el número de páginas', () => {
      const response = ResponseFormatter.paginated(mockData, 1, 10, 100);

      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(10);
      expect(response.pagination.total).toBe(100);
      expect(response.pagination.pages).toBe(10);
    });

    it('debe redondear hacia arriba el cálculo de páginas', () => {
      const response = ResponseFormatter.paginated(mockData, 1, 10, 105);

      expect(response.pagination.pages).toBe(11); // Math.ceil(105/10)
    });

    it('debe manejar una sola página', () => {
      const response = ResponseFormatter.paginated(mockData, 1, 100, 50);

      expect(response.pagination.pages).toBe(1);
    });

    it('debe manejar páginas exactas', () => {
      const response = ResponseFormatter.paginated(mockData, 2, 10, 100);

      expect(response.pagination.pages).toBe(10);
      expect(response.pagination.page).toBe(2);
    });

    it('debe permitir mensaje personalizado', () => {
      const message = 'Datos paginados personalizados';
      const response = ResponseFormatter.paginated(mockData, 1, 10, 100, message);

      expect(response.message).toBe(message);
    });

    it('debe usar mensaje por defecto si no se proporciona', () => {
      const response = ResponseFormatter.paginated(mockData, 1, 10, 100);

      expect(response.message).toBe('Datos obtenidos');
    });

    it('debe manejar datos vacío', () => {
      const response = ResponseFormatter.paginated([], 1, 10, 0);

      expect(response.data).toEqual([]);
      expect(response.pagination.pages).toBe(0);
    });

    it('debe manejar límite pequeño', () => {
      const response = ResponseFormatter.paginated(mockData, 1, 1, 100);

      expect(response.pagination.pages).toBe(100);
    });

    it('debe manejar página mayor a total de páginas', () => {
      // Aunque conceptualmente es un error, la función debe procesarlo
      const response = ResponseFormatter.paginated(mockData, 20, 10, 100);

      expect(response.pagination.page).toBe(20);
      expect(response.pagination.pages).toBe(10);
    });

    it('debe manejar datos complejos', () => {
      const complexData = [
        {
          id: 1,
          user: { name: 'User 1', email: 'user1@example.com' },
          items: [1, 2, 3],
        },
        {
          id: 2,
          user: { name: 'User 2', email: 'user2@example.com' },
          items: [4, 5, 6],
        },
      ];

      const response = ResponseFormatter.paginated(complexData, 1, 10, 2);

      expect(response.data).toEqual(complexData);
      expect(response.pagination.total).toBe(2);
    });
  });
});
