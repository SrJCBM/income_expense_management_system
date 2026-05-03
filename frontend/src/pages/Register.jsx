import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import '../styles/Auth.css';

const Register = () => {
  const { register, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (values) => {
    // Validaciones de cliente con mensajes claros
    if (!values.name.trim() || !values.email.trim() || !values.password.trim()) {
      throw { validationErrors: { general: 'Por favor, completa todos los campos requeridos.' } };
    }
    
    if (values.password !== values.confirmPassword) {
      throw { validationErrors: { confirmPassword: 'Las contraseñas no coinciden. Por favor verifica.' } };
    }

    if (values.password.length < 6) {
      throw { validationErrors: { password: 'La contraseña debe tener al menos 6 caracteres.' } };
    }

    const { confirmPassword, ...userData } = values;
    
    // Al finalizar el registro con éxito, el hook useAuth hará el login automático
    await register(userData);
    navigate('/');
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    handleRegisterSubmit
  );

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className="auth-container">
      <div className="auth-card" role="main" aria-labelledby="register-title">
        <div className="auth-header">
          <h2 id="register-title">Crear Cuenta</h2>
          <p>Únete y toma el control total de tus finanzas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Feedback General */}
          {(authError || errors.general || errors.submit) && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="error-message">
              {authError || errors.general || errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              disabled={isFormDisabled}
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              data-testid="name-input"
            />
            {errors.name && <span id="name-error" className="error-text" role="alert">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={isFormDisabled}
              required
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              data-testid="email-input"
            />
            {errors.email && <span id="email-error" className="error-text" role="alert">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              disabled={isFormDisabled}
              required
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              data-testid="password-input"
            />
            {errors.password && <span id="password-error" className="error-text" role="alert">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              disabled={isFormDisabled}
              required
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              data-testid="confirm-password-input"
            />
            {errors.confirmPassword && <span id="confirmPassword-error" className="error-text" role="alert">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary w-100"
            disabled={isFormDisabled}
            aria-busy={isFormDisabled}
            data-testid="register-button"
          >
            {isFormDisabled ? 'Registrando tu cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
