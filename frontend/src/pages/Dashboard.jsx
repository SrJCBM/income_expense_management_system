/**
 * Página: Plantilla de Página
 * Estructura base para páginas principales
 */

import React from 'react';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel de Control</h1>
      </header>

      <main className="dashboard-content">
        {/* Contenido de la página */}
      </main>
    </div>
  );
};

export default Dashboard;
