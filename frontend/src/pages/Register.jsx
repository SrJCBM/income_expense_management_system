/**
 * Página: Register
 * Página de registro de nuevos usuarios
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/pages/Register.css';

const Register = () => {
  const { register, isLoading, error } = useAuth();

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Crear Cuenta</h1>
        <p>Únete a nosotros para gestionar tus finanzas</p>
        {/* <RegisterForm onSubmit={register} isLoading={isLoading} error={error} /> */}
      </div>
    </div>
  );
};

export default Register;
