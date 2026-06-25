/**
 * Custom Hook para Presupuestos
 * Maneja la lógica de presupuestos mensuales
 */

import { useState } from 'react';
import budgetService from '../services/budgetService.js';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBudgets = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await budgetService.getBudgets(filters);
      setBudgets(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addBudget = async (budgetData) => {
    const response = await budgetService.createBudget(budgetData);
    setBudgets((current) => [response.data, ...current]);
    return response;
  };

  const updateBudget = async (id, budgetData) => {
    const response = await budgetService.updateBudget(id, budgetData);
    setBudgets((current) => current.map((budget) => (budget.id === id ? response.data : budget)));
    return response;
  };

  const removeBudget = async (id) => {
    await budgetService.deleteBudget(id);
    setBudgets((current) => current.filter((budget) => budget.id !== id));
  };

  return {
    budgets,
    isLoading,
    error,
    fetchBudgets,
    addBudget,
    updateBudget,
    removeBudget,
  };
};
