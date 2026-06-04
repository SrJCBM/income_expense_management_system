import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import '../styles/Auth.css';

const Register = () => {
  const { register, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (values) => {
    const trimmedName = values.name.trim();

    if (!trimmedName || !values.email.trim() || !values.password.trim()) {
      throw { validationErrors: { general: 'Por favor, completa todos los campos requeridos.' } };
    }

    if (!/[A-Za-z]/.test(trimmedName)) {
      throw { validationErrors: { name: 'El nombre debe incluir al menos una letra.' } };
    }

    if (values.password !== values.confirmPassword) {
      throw { validationErrors: { confirmPassword: 'Las contrasenas no coinciden. Por favor verifica.' } };
    }

    if (values.password.length < 8) {
      throw { validationErrors: { password: 'La contrasena debe tener al menos 8 caracteres.' } };
    }

    const { confirmPassword, ...userData } = values;
    userData.name = trimmedName;

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
          <p>Unete y toma el control total de tus finanzas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
              placeholder="Ej. Juan Perez"
              disabled={isFormDisabled}
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              data-testid="name-input"
            />
            {errors.name && <span id="name-error" className="error-text" role="alert">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electronico</label>
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
              aria-describedby={errors.email ? 'email-error' : undefined}
              data-testid="email-input"
            />
            {errors.email && <span id="email-error" className="error-text" role="alert">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contrasena</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Minimo 8 caracteres"
              disabled={isFormDisabled}
              required
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              data-testid="password-input"
            />
            {errors.password && <span id="password-error" className="error-text" role="alert">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contrasena</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contrasena"
              disabled={isFormDisabled}
              required
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              data-testid="confirm-password-input"
            />
            {errors.confirmPassword && (
              <span id="confirmPassword-error" className="error-text" role="alert">
                {errors.confirmPassword}
              </span>
            )}
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
          <p>Ya tienes cuenta? <Link to="/login">Inicia sesion</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
