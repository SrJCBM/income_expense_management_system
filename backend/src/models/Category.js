/**
 * Modelo de Categoría
 * Esquema MongoDB para categorías de gastos/ingresos
 */

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    color: {
      type: String,
      default: '#007bff',
    },
    icon: {
      type: String,
      default: '📌',
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, type: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
