import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/Layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/incomes', label: 'Ingresos', icon: '📈' },
  { to: '/expenses', label: 'Gastos', icon: '📉' },
  { to: '/budgets', label: 'Presupuestos', icon: '🎯' },
  { to: '/categories', label: 'Categorías', icon: '🏷️' },
  { to: '/reports', label: 'Reportes', icon: '📋' },
  { to: '/profile', label: 'Mi Perfil', icon: '👤' },
];

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <div className="layout-container">
      <aside className={`sidebar ${isMobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">💰</div>
          <h2>Finance<span>App</span></h2>
        </div>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={closeMobileNav}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-plan">Premium plan</span>
            </div>
            <button className="btn-logout" onClick={handleLogout} data-testid="logout-button" title="Cerrar Sesión">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {isMobileNavOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileNav} aria-hidden="true"></div>
      )}

      <main className="main-content">
        <header className="topbar-mobile">
          <button
            type="button"
            className="btn-menu-toggle"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-expanded={isMobileNavOpen}
            aria-label={isMobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
            data-testid="mobile-menu-toggle"
          >
            ☰
          </button>
          <h2>Finance<span style={{color:'#a5b4fc'}}>App</span></h2>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
