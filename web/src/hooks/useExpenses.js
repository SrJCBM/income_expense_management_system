import { useState } from 'react';
import expenseService from '../services/expenseService.js';

const DEFAULT_PAGINATION = { page: 1, totalPages: 1, total: 0, limit: 20 };

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await expenseService.getExpenses(filters);
      setExpenses(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        totalPages: response.pagination?.pages || 1,
        total: response.pagination?.total || 0,
        limit: response.pagination?.limit || 20,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await expenseService.createExpense(expenseData);
      setExpenses((prev) => [response.data, ...prev]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await expenseService.updateExpense(id, expenseData);
      setExpenses((prev) => prev.map((e) => (e.id === id ? response.data : e)));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { expenses, pagination, isLoading, error, fetchExpenses, addExpense, updateExpense, removeExpense };
};
