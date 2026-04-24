/**
 * Utilidades de Autenticación
 * Funciones para JWT y encriptación
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Generar token JWT
 */
export const generateToken = (userId, email, role = 'user') => {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

/**
 * Verificar token JWT
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

/**
 * Encriptar contraseña
 */
export const hashPassword = async (password) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return bcrypt.hash(password, rounds);
};

/**
 * Comparar contraseñas
 */
export const comparePasswords = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
