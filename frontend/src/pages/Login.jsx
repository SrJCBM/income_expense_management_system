import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import AuthBrand from '../components/AuthBrand.jsx';
import '../styles/Auth.css';

const Login = () => {
  const { login, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (values) => {
    const email = values.email.trim();
    const password = values.password.trim();

    if (!email || !password) {
      throw { validationErrors: { general: 'Por favor, completa todos los campos para continuar.' } };
    }

    await login(email, password);
    navigate('/');
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    handleLoginSubmit
  );

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className="auth-container">
      <AuthBrand variant="login" />

      <div className="auth-form-side">
        <div className="auth-card" role="main" aria-labelledby="login-title">
          <div className="auth-header">
            <h2 id="login-title">Bienvenido de nuevo</h2>
            <p>Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {(authError || errors.general || errors.submit) && (
              <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="error-message">
                {authError || errors.general || errors.submit}
              </div>
            )}

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
                aria-describedby={errors.email ? 'email-error' : undefined}
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
                placeholder="••••••••"
                disabled={isFormDisabled}
                required
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                data-testid="password-input"
              />
              {errors.password && <span id="password-error" className="error-text" role="alert">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary w-100"
              disabled={isFormDisabled}
              aria-busy={isFormDisabled}
              data-testid="login-button"
            >
              {isFormDisabled ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="auth-footer">
            <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
