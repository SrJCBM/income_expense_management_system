import { useState, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses.js';
import ExpenseList from '../components/ExpenseList.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import '../styles/pages/Expenses.css';

const Expenses = () => {
  const { expenses, isLoading, error, fetchExpenses, addExpense, updateExpense, removeExpense } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (data) => {
    await addExpense(data);
    setShowForm(false);
  };

  const handleUpdate = async (data) => {
    await updateExpense(editingExpense.id || editingExpense._id, data);
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
      await removeExpense(id);
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
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
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          + Nuevo Gasto
        </button>
      </header>

      {showForm ? (
        <div className="card form-card">
          <h3>{editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</h3>
          <ExpenseForm 
            initialData={editingExpense} 
            onSubmit={editingExpense ? handleUpdate : handleCreate}
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
