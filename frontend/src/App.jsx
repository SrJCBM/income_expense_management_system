/**
 * Archivo principal App.jsx
 * Componente raíz de la aplicación React
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Reports from './pages/Reports.jsx';
import Incomes from './pages/Incomes.jsx';
import Categories from './pages/Categories.jsx';
import Budgets from './pages/Budgets.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas Privadas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/incomes" element={<Incomes />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
