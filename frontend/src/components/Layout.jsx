import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ConnectionStatusCard from './ConnectionStatusCard.jsx';
import '../styles/Layout.css';

const Layout = () => {
  const { logout, user } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const NAV_ITEMS = [
    { to: '/',            label: t('nav.dashboard'),   icon: '📊', end: true },
    { to: '/incomes',     label: t('nav.incomes'),     icon: '📈' },
    { to: '/expenses',    label: t('nav.expenses'),    icon: '📉' },
    { to: '/budgets',     label: t('nav.budgets'),     icon: '🎯' },
    { to: '/categories',  label: t('nav.categories'),  icon: '🏷️' },
    { to: '/reports',     label: t('nav.reports'),     icon: '📋' },
    { to: '/profile',     label: t('nav.profile'),     icon: '👤' },
  ];

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
        <nav className="sidebar-nav" aria-label={t('common.mainNav')}>
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
          <ConnectionStatusCard />
          <div className="user-info">
            <div className="user-avatar">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-plan">Premium plan</span>
            </div>
            <button
              className="btn-lang-toggle"
              onClick={toggleLang}
              aria-label={t('common.changeLang')}
              title={t('common.changeLang')}
            >
              {t('lang.toggle')}
            </button>
            <button
              className="btn-logout"
              onClick={handleLogout}
              data-testid="logout-button"
              title={t('nav.logout')}
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {isMobileNavOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileNav} aria-hidden="true" />
      )}

      <main className="main-content">
        <header className="topbar-mobile">
          <button
            type="button"
            className="btn-menu-toggle"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-expanded={isMobileNavOpen}
            aria-label={isMobileNavOpen ? t('common.closeMenu') : t('common.openMenu')}
            data-testid="mobile-menu-toggle"
          >
            ☰
          </button>
          <h2>Finance<span style={{ color: '#a5b4fc' }}>App</span></h2>
          <button
            className="btn-lang-toggle"
            onClick={toggleLang}
            aria-label={t('common.changeLang')}
          >
            {t('lang.toggle')}
          </button>
          <ConnectionStatusCard compact />
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
