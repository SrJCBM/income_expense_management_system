import { useAuth } from '../hooks/useAuth.js';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Panel de Control</h1>
        <p className="subtitle">Bienvenido de nuevo, {user?.name || 'Usuario'}</p>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card summary-card">
          <h3>Balance Total</h3>
          <p className="amount">$0.00</p>
        </div>
        <div className="dashboard-card incomes-card">
          <h3>Ingresos del Mes</h3>
          <p className="amount positive">+$0.00</p>
        </div>
        <div className="dashboard-card expenses-card">
          <h3>Gastos del Mes</h3>
          <p className="amount negative">-$0.00</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity">
          <h3>Actividad Reciente</h3>
          <div className="empty-state">
            <p>No hay actividad reciente para mostrar.</p>
            <p className="hint">Comienza agregando un ingreso o un gasto.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
