/**
 * Página: Expenses
 * Página para gestionar gastos
 */

import React from 'react';
import { useExpenses } from '../hooks/useExpenses.js';
import '../styles/pages/Expenses.css';

const Expenses = () => {
  const { expenses, isLoading, error, fetchExpenses } = useExpenses();

  return (
    <div className="expenses-container">
      <h1>Gestionar Gastos</h1>
      <div className="expenses-content">
        {/* Contenido aquí */}
      </div>
    </div>
  );
};

export default Expenses;
