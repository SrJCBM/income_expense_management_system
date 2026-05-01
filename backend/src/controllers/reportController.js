/**
 * Controladores de Reportes
 */

import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

const getPeriodRange = (monthQuery, yearQuery) => {
  const now = new Date();
  const month = Number(monthQuery) || now.getMonth() + 1;
  const year = Number(yearQuery) || now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return { month, year, startDate, endDate };
};

const getMonthlySummary = async ({ userId, month, year }) => {
  const { startDate, endDate } = getPeriodRange(month, year);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [incomeAgg, expenseAgg, breakdownAgg] = await Promise.all([
    Income.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]),
  ]);

  const totalIncome = Number(incomeAgg[0]?.total || 0);
  const totalExpense = Number(expenseAgg[0]?.total || 0);
  const balance = totalIncome - totalExpense;

  const expensesByCategory = breakdownAgg.map((item) => ({
    categoryId: item._id?.toString() || null,
    name: item.category?.name || 'Sin categoría',
    amount: Number(item.amount || 0),
    color: item.category?.color || '#64748b',
    percentage:
      totalExpense > 0
        ? Number(((Number(item.amount || 0) / totalExpense) * 100).toFixed(2))
        : 0,
  }));

  return {
    totalIncome,
    totalExpense,
    balance,
    expensesByCategory,
  };
};

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await getMonthlySummary({
    userId: req.user.userId,
    month: req.query.month,
    year: req.query.year,
  });

  res.status(200).json(successResponse(summary, 'Resumen obtenido'));
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const summary = await getMonthlySummary({
    userId: req.user.userId,
    month: req.query.month,
    year: req.query.year,
  });

  res.status(200).json(successResponse(summary, 'Reporte mensual obtenido'));
});

export const getYearlyReport = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const [incomeByMonth, expenseByMonth] = await Promise.all([
    Income.aggregate([
      { $match: { userId: userObjectId, date: { $gte: yearStart, $lt: yearEnd } } },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjectId, date: { $gte: yearStart, $lt: yearEnd } } },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const incomeMap = new Map(incomeByMonth.map((row) => [row._id, Number(row.total || 0)]));
  const expenseMap = new Map(expenseByMonth.map((row) => [row._id, Number(row.total || 0)]));

  const months = Array.from({ length: 12 }, (_, idx) => {
    const monthNumber = idx + 1;
    const income = incomeMap.get(monthNumber) || 0;
    const expense = expenseMap.get(monthNumber) || 0;

    return {
      month: monthNumber,
      income,
      expense,
      balance: income - expense,
    };
  });

  const totals = months.reduce(
    (acc, row) => {
      acc.totalIncome += row.income;
      acc.totalExpense += row.expense;
      acc.balance += row.balance;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 }
  );

  res.status(200).json(
    successResponse(
      {
        year,
        months,
        totals,
      },
      'Reporte anual obtenido'
    )
  );
});

export const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const summary = await getMonthlySummary({
    userId: req.user.userId,
    month: req.query.month,
    year: req.query.year,
  });

  res.status(200).json(
    successResponse(summary.expensesByCategory, 'Desglose por categoría obtenido')
  );
});

export const getReportFilters = asyncHandler(async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

  const [expensePeriods, incomePeriods] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
        },
      },
    ]),
    Income.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
        },
      },
    ]),
  ]);

  const periods = [...expensePeriods, ...incomePeriods];
  const monthsByYearMap = new Map();

  periods.forEach((period) => {
    const year = period?._id?.year;
    const month = period?._id?.month;

    if (!year || !month) {
      return;
    }

    if (!monthsByYearMap.has(year)) {
      monthsByYearMap.set(year, new Set());
    }

    monthsByYearMap.get(year).add(month);
  });

  const years = Array.from(monthsByYearMap.keys()).sort((a, b) => b - a);

  const monthsByYear = years.reduce((acc, year) => {
    acc[year] = Array.from(monthsByYearMap.get(year)).sort((a, b) => a - b);
    return acc;
  }, {});

  const now = new Date();
  const fallbackYear = now.getFullYear();
  const fallbackMonth = now.getMonth() + 1;

  const suggestedYear = years[0] || fallbackYear;
  const monthsForSuggestedYear = monthsByYear[suggestedYear] || [];
  const suggestedMonth = monthsForSuggestedYear[monthsForSuggestedYear.length - 1] || fallbackMonth;

  const data = {
    years: years.length > 0 ? years : [fallbackYear],
    monthsByYear,
    suggestedYear,
    suggestedMonth,
    hasData: years.length > 0,
  };

  res.status(200).json(successResponse(data, 'Filtros de reportes obtenidos'));
});
