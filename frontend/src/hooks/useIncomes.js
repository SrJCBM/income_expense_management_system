import { useState } from 'react';
import incomeService from '../services/incomeService.js';

const DEFAULT_PAGINATION = { page: 1, totalPages: 1, total: 0, limit: 20 };

export const useIncomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncomes = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await incomeService.getIncomes(filters);
      setIncomes(response.data || []);
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

  const addIncome = async (incomeData) => {
    try {
      setError(null);
      const response = await incomeService.createIncome(incomeData);
      setIncomes((prev) => [response.data, ...prev]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      setError(null);
      const response = await incomeService.updateIncome(id, incomeData);
      setIncomes((prev) => prev.map((inc) => {
        const incId = inc.id || inc._id;
        return incId === id ? response.data : inc;
      }));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeIncome = async (id) => {
    try {
      setError(null);
      await incomeService.deleteIncome(id);
      setIncomes((prev) => prev.filter((inc) => (inc.id || inc._id) !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { incomes, pagination, isLoading, error, fetchIncomes, addIncome, updateIncome, removeIncome };
};
