import { useState, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses.js';
import ExpenseList from '../components/ExpenseList.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';
import '../styles/pages/Expenses.css';

const Expenses = () => {
  const { expenses, isLoading, error, fetchExpenses, addExpense, updateExpense, removeExpense } = useExpenses();
  const [showForm, setShowForm]             = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter]       = useState('');

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSubmit = async (data) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id || editingExpense._id, data);
      setSuccessMessage('Gasto actualizado exitosamente.');
      setEditingExpense(null);
    } else {
      await addExpense(data);
      setSuccessMessage('Gasto creado exitosamente.');
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
      await removeExpense(id);
      setSuccessMessage('Gasto eliminado exitosamente.');
    }
  };

  const handleEditClick = (expense) => {
    if (successMessage) setSuccessMessage('');
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleNewExpense = () => {
    if (successMessage) setSuccessMessage('');
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleApplyFilters = () => {
    const filters = {};
    if (categoryFilter) filters.categoryId = categoryFilter;
    if (monthFilter)    filters.month      = monthFilter;
    fetchExpenses(filters);
  };

  return (
    <div className="expenses-container">
      <header className="page-header flex-between">
        <div>
          <h1>Gestionar Gastos</h1>
          <p className="subtitle">Lleva el control de todos tus egresos</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleNewExpense}
          disabled={showForm}
          data-testid="new-expense-button"
        >
          + Nuevo Gasto
        </button>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" data-testid="success-message">
          {successMessage}
        </div>
      )}

      <div className="filters-bar" data-testid="expense-filters">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          data-testid="filter-category"
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {EXPENSE_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          data-testid="filter-month"
          aria-label="Filtrar por mes"
        />

        <button
          type="button"
          className="btn-secondary"
          onClick={handleApplyFilters}
          data-testid="apply-filters"
        >
          Filtrar
        </button>
      </div>

      {showForm ? (
        <div className="card form-card">
          <h3>{editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</h3>
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      ) : (
        <div className="card list-card">
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            error={error}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default Expenses;
