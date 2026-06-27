import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import '../styles/Auth.css';

const BrandPanel = () => (
  <aside className="auth-brand" aria-hidden="true">
    <div className="auth-brand-content">
      <div className="auth-brand-logo">
        <div className="auth-brand-icon">💎</div>
        <span className="auth-brand-name">Fin<span>Track</span></span>
      </div>

      <h1 className="auth-brand-tagline">
        Cada peso<br />con <em>propósito</em>
      </h1>

      <ul className="auth-brand-features">
        <li><span className="auth-feature-dot" />Registra ingresos y gastos al instante</li>
        <li><span className="auth-feature-dot" />Presupuestos con alertas en tiempo real</li>
        <li><span className="auth-feature-dot" />Reportes y análisis visuales del mes</li>
      </ul>

      <div className="auth-preview-card">
        <p className="auth-preview-label">Balance del mes</p>
        <p className="auth-preview-amount">+$3,240.00</p>
        <div className="auth-preview-bars">
          <div className="auth-preview-bar-row">
            <span>Ingresos</span>
            <div className="auth-preview-bar-track">
              <div className="auth-preview-bar-fill" style={{ width: '78%', background: '#10b981' }} />
            </div>
          </div>
          <div className="auth-preview-bar-row">
            <span>Gastos</span>
            <div className="auth-preview-bar-track">
              <div className="auth-preview-bar-fill" style={{ width: '45%', background: '#f87171' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
);

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
      <BrandPanel />

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
