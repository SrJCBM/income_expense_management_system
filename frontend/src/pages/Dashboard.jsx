import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import reportService from '../services/reportService.js';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    expensesByCategory: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const now = new Date();
        const response = await reportService.getSummary(now.getMonth() + 1, now.getFullYear());
        setSummary(response.data || response);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Panel de Control</h1>
        <p className="subtitle">Bienvenido de nuevo, {user?.name || 'Usuario'}</p>
      </header>

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card summary-card">
          <h2>Balance Total</h2>
          <p className="amount">{isLoading ? '...' : formatCurrency(summary.balance)}</p>
        </div>
        <div className="dashboard-card incomes-card">
          <h2>Ingresos del Mes</h2>
          <p className="amount positive">{isLoading ? '...' : `+${formatCurrency(summary.totalIncome)}`}</p>
        </div>
        <div className="dashboard-card expenses-card">
          <h2>Gastos del Mes</h2>
          <p className="amount negative">{isLoading ? '...' : `-${formatCurrency(summary.totalExpense)}`}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity">
          <h2>Actividad Reciente</h2>
          {summary.expensesByCategory?.length > 0 ? (
            <div className="category-summary">
              <p className="summary-title">Distribución de gastos por categoría</p>
              <ul className="category-summary-list">
                {summary.expensesByCategory.map((item) => (
                  <li key={item.categoryId || item.name} className="category-item">
                    <span className="cat-name">{item.name}</span>
                    <span className="cat-amount">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay actividad reciente para mostrar.</p>
              <p className="hint">Comienza agregando un ingreso o un gasto.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
