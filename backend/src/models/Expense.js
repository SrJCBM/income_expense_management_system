/**
 * Plantilla de Modelo
 * Esquema MongoDB para la entidad Expense
 */

import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    // Usuario propietario del gasto
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Descripción del gasto
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Cantidad del gasto
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Categoría del gasto
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // Fecha del gasto
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // Notas adicionales
    notes: {
      type: String,
      maxlength: 1000,
    },

    // Etiquetas para búsqueda avanzada
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Gasto recurrente (se repite cada mes)
    isRecurring: {
      type: Boolean,
      default: false,
    },

    clientRequestId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas frecuentes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index(
  { userId: 1, clientRequestId: 1 },
  { unique: true, partialFilterExpression: { clientRequestId: { $type: 'string' } } }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
