const ExpenseList = ({ expenses, isLoading, error, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="expense-list-loading">
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        Error al cargar los gastos: {error}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No tienes gastos registrados</h3>
        <p className="hint">Agrega un nuevo gasto para comenzar a llevar el control.</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
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
            <tr key={expense.id || expense._id}>
              <td>{new Date(expense.date).toLocaleDateString()}</td>
              <td>{expense.concept}</td>
              <td>{expense.category?.name || 'Sin categoría'}</td>
              <td className="amount negative">-${parseFloat(expense.amount).toFixed(2)}</td>
              <td className="actions-cell">
                <button 
                  className="btn-icon btn-edit" 
                  onClick={() => onEdit(expense)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  className="btn-icon btn-delete" 
                  onClick={() => onDelete(expense.id || expense._id)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
