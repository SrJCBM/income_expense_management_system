/**
 * Componente: Plantilla de Componente
 * Estructura base para componentes React reutilizables
 */

import React from 'react';
import '../styles/components/Button.css';

/**
 * Componente Button
 * @param {string} type - Tipo de botón (primary, secondary, danger)
 * @param {string} size - Tamaño del botón (small, medium, large)
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {function} onClick - Función a ejecutar al clickear
 * @param {string} children - Contenido del botón
 */
const Button = ({
  type = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children,
  ...props
}) => {
  const className = `btn btn-${type} btn-${size} ${disabled ? 'btn-disabled' : ''}`;

  return (
    <button className={className} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
