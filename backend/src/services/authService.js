/**
 * Plantilla de Servicio de Negocio
 * Estructura base para servicios que contienen lógica reutilizable
 */

import User from '../models/User.js';
import {
	AuthenticationError,
	ConflictError,
	NotFoundError,
} from '../errors/ApplicationError.js';
import {
	comparePasswords,
	generateToken,
	hashPassword,
	verifyToken,
} from '../utils/authUtils.js';
import { ensureDefaultCategoriesForUser } from './categoryService.js';

/**
 * AuthService - Lógica de autenticación
 * 
 * Este es un ejemplo de cómo estructurar servicios.
 * Los servicios contienen la lógica de negocio que puede reutilizarse
 * en múltiples controladores.
 */

const sanitizeUser = (userDocument) => {
	const user = userDocument.toObject ? userDocument.toObject() : userDocument;

	return {
		userId: user._id.toString(),
		email: user.email,
		name: user.name,
		role: user.role,
		currency: user.currency || 'USD',
		createdAt: user.createdAt,
		lastLoginAt: user.lastLoginAt || null,
	};
};

class AuthService {
	async registerUser({ name, email, password }) {
		const normalizedEmail = String(email).trim().toLowerCase();

		const existingUser = await User.findOne({ email: normalizedEmail });

		if (existingUser) {
			throw new ConflictError('Ya existe una cuenta con este email');
		}

		const hashedPassword = await hashPassword(password);

		const user = await User.create({
			name: String(name).trim(),
			email: normalizedEmail,
			password: hashedPassword,
		});

		await ensureDefaultCategoriesForUser(user._id);

		const token = generateToken(user._id.toString(), user.email, user.role);

		return {
			user: sanitizeUser(user),
			token,
		};
	}

	async loginUser({ email, password }) {
		const normalizedEmail = String(email).trim().toLowerCase();

		const user = await User.findOne({ email: normalizedEmail }).select('+password');

		if (!user || !user.isActive) {
			throw new AuthenticationError('Credenciales inválidas');
		}

		const isValidPassword = await comparePasswords(password, user.password);

		if (!isValidPassword) {
			throw new AuthenticationError('Credenciales inválidas');
		}

		user.lastLoginAt = new Date();
		await user.save();

		const token = generateToken(user._id.toString(), user.email, user.role);

		return {
			user: sanitizeUser(user),
			token,
		};
	}

	async refreshUserToken(currentToken) {
		const decoded = verifyToken(currentToken);

		const user = await User.findById(decoded.userId);

		if (!user || !user.isActive) {
			throw new NotFoundError('Usuario no encontrado para refrescar token');
		}

		const token = generateToken(user._id.toString(), user.email, user.role);

		return {
			user: sanitizeUser(user),
			token,
		};
	}

	async getUserProfile(userId) {
		const user = await User.findById(userId);

		if (!user || !user.isActive) {
			throw new NotFoundError('Usuario no encontrado');
		}

		return sanitizeUser(user);
	}

	async updateUserProfile(userId, { name, currency }) {
		const user = await User.findById(userId);

		if (!user || !user.isActive) {
			throw new NotFoundError('Usuario no encontrado');
		}

		if (typeof name === 'string' && name.trim()) {
			user.name = name.trim();
		}

		if (typeof currency === 'string' && currency.trim()) {
			user.currency = currency.trim().toUpperCase();
		}

		await user.save();

		return sanitizeUser(user);
	}

	async changeUserPassword(userId, { currentPassword, newPassword }) {
		const user = await User.findById(userId).select('+password');

		if (!user || !user.isActive) {
			throw new NotFoundError('Usuario no encontrado');
		}

		const isValidPassword = await comparePasswords(currentPassword, user.password);

		if (!isValidPassword) {
			throw new AuthenticationError('La contraseña actual es incorrecta');
		}

		user.password = await hashPassword(newPassword);
		await user.save();

		return sanitizeUser(user);
	}
}

export default new AuthService();
