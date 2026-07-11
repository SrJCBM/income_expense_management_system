/**
 * Modelo de Usuario
 * Estructura de datos del usuario en el frontend
 */

export class UserModel {
  constructor(userId, email, name, role = 'user') {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.role = role;
    this.createdAt = new Date();
  }

  /**
   * Obtener datos básicos del usuario
   */
  getBasicInfo() {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
    };
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Verificar si el usuario es propietario de un recurso
   */
  isResourceOwner(resourceUserId) {
    return this.userId === resourceUserId;
  }
}

/**
 * Modelo de Gasto
 * Estructura de datos del gasto en el frontend
 */
export class ExpenseModel {
  constructor(id, description, amount, category, date, notes = '', tags = []) {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.notes = notes;
    this.tags = tags;
  }

  /**
   * Validar que los datos sean correctos
   */
  validate() {
    if (!this.description || this.description.trim() === '') {
      throw new Error('La descripción es requerida');
    }
    if (!this.amount || this.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    if (!this.category) {
      throw new Error('La categoría es requerida');
    }
    if (!this.date) {
      throw new Error('La fecha es requerida');
    }
    return true;
  }

  /**
   * Obtener datos formateados para enviar al servidor
   */
  toJSON() {
    return {
      description: this.description.trim(),
      amount: parseFloat(this.amount),
      category: this.category,
      date: this.date,
      notes: this.notes.trim(),
      tags: this.tags,
    };
  }
}

/**
 * Modelo de Ingreso
 * Estructura de datos del ingreso en el frontend
 */
export class IncomeModel {
  constructor(id, description, amount, category, date, notes = '') {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.notes = notes;
  }

  validate() {
    if (!this.description || this.description.trim() === '') {
      throw new Error('La descripción es requerida');
    }
    if (!this.amount || this.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    if (!this.category) {
      throw new Error('La categoría es requerida');
    }
    if (!this.date) {
      throw new Error('La fecha es requerida');
    }
    return true;
  }

  toJSON() {
    return {
      description: this.description.trim(),
      amount: parseFloat(this.amount),
      category: this.category,
      date: this.date,
      notes: this.notes.trim(),
    };
  }
}
