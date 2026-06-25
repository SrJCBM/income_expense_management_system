/**
 * Modelo de Usuario
 * Esquema MongoDB para autenticación y perfil
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 120,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			maxlength: 180,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		currency: {
			type: String,
			enum: ['USD', 'EUR', 'MXN', 'PEN', 'COP', 'ARS', 'CLP'],
			default: 'USD',
		},
		lastLoginAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;
