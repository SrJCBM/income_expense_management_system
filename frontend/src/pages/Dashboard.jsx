import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import reportService from '../services/reportService.js';
import budgetService from '../services/budgetService.js';
import { getMonthName } from '../utils/formatters.js';
import '../styles/pages/Dashboard.css';

const calcTrend = (current, prev) => {
  if (!prev || prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
};

const TrendBadge = ({ trend }) => {
  if (trend === null || trend === 0) return null;
  const up = trend > 0;
  return (
    <span style={{
      fontSize: 11,
      color: up ? '#10b981' : '#f87171',
      display: 'block',
      marginTop: 4,
    }}>
      {up ? '▲' : '▼'} {Math.abs(trend)}% vs mes anterior
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { formatCurrency } = useSettings();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    expensesByCategory: [],
  });
  const [prevSummary, setPrevSummary] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentPeriodLabel = `${getMonthName(currentMonth)} ${currentYear}`;

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [currentRes, prevRes] = await Promise.all([
          reportService.getSummary(currentMonth, currentYear),
          reportService.getSummary(prevMonth, prevYear),
        ]);
        setSummary(currentRes.data || currentRes);
        setPrevSummary(prevRes.data || prevRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }

      try {
        const alertsResponse = await budgetService.getAlerts();
        setBudgetAlerts(alertsResponse.data || []);
      } catch {
        setBudgetAlerts([]);
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savingsRate =
    summary.totalIncome > 0
      ? Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100)
      : 0;

  const prevSavingsRate =
    prevSummary?.totalIncome > 0
      ? Math.round(((prevSummary.totalIncome - prevSummary.totalExpense) / prevSummary.totalIncome) * 100)
      : 0;

  const incomeTrend  = calcTrend(summary.totalIncome,  prevSummary?.totalIncome);
  const expenseTrend = calcTrend(summary.totalExpense, prevSummary?.totalExpense);
  const savingsTrend = calcTrend(savingsRate, prevSavingsRate);

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Panel de Control</h1>
        <p className="subtitle">
          Bienvenido de nuevo, {user?.name || 'Usuario'} · Resumen de {currentPeriodLabel}
        </p>
      </header>

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {budgetAlerts.length > 0 && (
        <div className="alert alert-warning" role="status" aria-live="polite" data-testid="budget-alerts">
          <strong>Alertas de presupuesto:</strong>{' '}
          {budgetAlerts.map((alert) => (
            <span key={alert.id} className="budget-alert-item" data-testid="budget-alert-item">
              {alert.category?.name || 'Categoría'}{' '}
              {alert.isOverBudget ? 'excedido' : `al ${alert.percentageUsed}%`}.{' '}
            </span>
          ))}
          <Link to="/budgets">Ver presupuestos</Link>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card summary-card" data-testid="dashboard-balance">
          <h2>Balance Total</h2>
          <p
            className={`amount ${(summary.netBalance ?? summary.balance) >= 0 ? 'positive' : 'negative'}`}
            data-testid="dashboard-balance-amount"
            title="Ingresos históricos menos gastos históricos acumulados"
          >
            {isLoading ? '...' : formatCurrency(summary.netBalance ?? summary.balance)}
          </p>
          <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Acumulado histórico</small>
        </div>
        <div className="dashboard-card incomes-card" data-testid="dashboard-incomes">
          <h2>Ingresos del Mes</h2>
          <p className="amount positive" data-testid="dashboard-incomes-amount">
            {isLoading ? '...' : `+${formatCurrency(summary.totalIncome)}`}
          </p>
          {!isLoading && <TrendBadge trend={incomeTrend} />}
        </div>
        <div className="dashboard-card expenses-card" data-testid="dashboard-expenses">
          <h2>Gastos del Mes</h2>
          <p className="amount negative" data-testid="dashboard-expenses-amount">
            {isLoading ? '...' : `-${formatCurrency(summary.totalExpense)}`}
          </p>
          {!isLoading && <TrendBadge trend={expenseTrend !== null ? -expenseTrend : null} />}
        </div>
        <div className="dashboard-card savings-card" data-testid="dashboard-savings">
          <h2>Tasa de Ahorro</h2>
          <p
            className={`amount ${savingsRate >= 0 ? 'positive' : 'negative'}`}
            data-testid="dashboard-savings-amount"
          >
            {isLoading ? '...' : `${savingsRate}%`}
          </p>
          {!isLoading && <TrendBadge trend={savingsTrend} />}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity">
          <div className="flex-between">
            <h2>Gastos por Categoría</h2>
            <Link to="/reports" className="dashboard-link">Ver reportes →</Link>
          </div>
          {isLoading ? (
            <div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
            </div>
          ) : summary.expensesByCategory?.length > 0 ? (
            <div className="category-summary">
              <p className="summary-title">Distribución de gastos por categoría</p>
              <ul className="category-summary-list">
                {summary.expensesByCategory.map((item) => {
                  const share =
                    summary.totalExpense > 0
                      ? Math.round((item.amount / summary.totalExpense) * 100)
                      : 0;
                  return (
                    <li key={item.categoryId || item.name} className="category-item" data-testid="dashboard-category-item">
                      <span className="cat-name">{item.name}</span>
                      <span className="cat-bar" aria-hidden="true">
                        <span className="cat-bar-fill" style={{ width: `${share}%` }}></span>
                      </span>
                      <span className="cat-amount">
                        {formatCurrency(item.amount)} <small>({share}%)</small>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="empty-state" data-testid="dashboard-empty-state">
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
