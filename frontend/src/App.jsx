/**
 * Archivo principal App.jsx
 * Componente raíz de la aplicación React
 */

import React from 'react';
import './App.css';

function App() {
  const [user, setUser] = React.useState(null);

  return (
    <div className="App">
      <header className="app-header">
        <h1>💰 Sistema de Control de Gastos e Ingresos</h1>
        <p>Gestiona tus finanzas personales de forma inteligente</p>
      </header>

      <main className="app-main">
        {!user ? (
          <div className="welcome-section">
            <h2>Bienvenido</h2>
            <p>Esta es la aplicación principal para controlar tus ingresos y gastos.</p>
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => alert('Login - Próximamente')}>
                Iniciar Sesión
              </button>
              <button className="btn btn-secondary" onClick={() => alert('Registro - Próximamente')}>
                Registrarse
              </button>
            </div>
          </div>
        ) : (
          <div className="dashboard-section">
            <h2>Bienvenido, {user.name}</h2>
            <p>Tu dashboard estará aquí pronto.</p>
          </div>
        )}

        <footer className="app-footer">
          <p>© 2024 Sistema de Control de Gastos - Todos los derechos reservados</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
