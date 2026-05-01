import { useState } from 'react';
import incomeService from '../services/incomeService.js';

export const useIncomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncomes = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await incomeService.getIncomes(filters);
      setIncomes(data.data || []);
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
      setIncomes((currentIncomes) => [response.data, ...currentIncomes]);
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
      setIncomes((currentIncomes) =>
        currentIncomes.map((income) => {
          const incomeId = income.id || income._id;
          return incomeId === id ? response.data : income;
        })
      );
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
      setIncomes((currentIncomes) =>
        currentIncomes.filter((income) => (income.id || income._id) !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    incomes,
    isLoading,
    error,
    fetchIncomes,
    addIncome,
    updateIncome,
    removeIncome,
  };
};
