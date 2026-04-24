/**
 * Modelo de Presupuesto
 * Esquema MongoDB para presupuestos
 */

import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    limitAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ userId: 1, year: 1, month: 1 });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
