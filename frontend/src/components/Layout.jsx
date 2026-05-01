import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/Layout.css';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💸 FinanceApp</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
            📊 Dashboard
          </NavLink>
          <NavLink to="/incomes" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            📈 Ingresos
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            📉 Gastos
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            🏷️ Categorías
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            📋 Reportes
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.name || 'Usuario'}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar-mobile">
          <h2>💸 FinanceApp</h2>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
