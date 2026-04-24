/**
 * Custom Hook para Expenses
 * Maneja la lógica de gastos
 */

import { useState } from 'react';
import expenseService from '../services/expenseService.js';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await expenseService.getExpenses(filters);
      setExpenses(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await expenseService.createExpense(expenseData);
      setExpenses([...expenses, response.data]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await expenseService.updateExpense(id, expenseData);
      setExpenses(expenses.map(e => (e.id === id ? response.data : e)));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    removeExpense,
  };
};
