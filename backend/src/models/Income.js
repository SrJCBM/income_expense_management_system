/**
 * Modelo de Ingreso
 * Esquema MongoDB para ingresos
 */

import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ userId: 1, date: -1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;
