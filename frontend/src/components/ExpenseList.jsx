import { useMemo } from 'react';

const ExpenseList = ({ expenses, isLoading, error, onEdit, onDelete }) => {
  const total = useMemo(
    () => (expenses || []).reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0),
    [expenses]
  );

  if (isLoading) {
    return (
      <div className="expense-list-loading" data-testid="expense-loading">
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" data-testid="expense-list-error">
        Error al cargar los gastos: {error}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state" data-testid="expense-empty">
        <div className="empty-icon">📭</div>
        <h3>No tienes gastos registrados</h3>
        <p className="hint">Agrega un nuevo gasto para comenzar a llevar el control.</p>
      </div>
    );
  }

  return (
    <div className="expense-list" data-testid="expense-list">
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Categoría</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id || expense._id} data-testid="expense-item">
              <td>{new Date(expense.date).toLocaleDateString()}</td>
              <td>{expense.concept}</td>
              <td>{expense.category?.name || 'Sin categoría'}</td>
              <td className="amount negative">-${parseFloat(expense.amount).toFixed(2)}</td>
              <td className="actions-cell">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => onEdit(expense)}
                  title="Editar"
                  data-testid="edit-expense"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => onDelete(expense.id || expense._id)}
                  title="Eliminar"
                  data-testid="delete-expense"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="3" className="total-label">Total gastos</td>
            <td className="amount negative" data-testid="expense-total">
              -${total.toFixed(2)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ExpenseList;
