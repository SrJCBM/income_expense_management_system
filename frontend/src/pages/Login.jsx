/**
 * Página: Login
 * Página de inicio de sesión
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
// import LoginForm from '../components/LoginForm';
import '../styles/pages/Login.css';

const Login = () => {
  const { login, isLoading, error } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Inicia Sesión</h1>
        <p>Sistema de Control de Gastos e Ingresos</p>
        {/* <LoginForm onSubmit={login} isLoading={isLoading} error={error} /> */}
      </div>
    </div>
  );
};

export default Login;
