// frontend/src/pages/Login.jsx
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import AuthBrand from '../components/AuthBrand.jsx';
import PasswordField from '../components/PasswordField.jsx';
import '../styles/Auth.css';

const Login = () => {
  const { login, isLoading, error: authError } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const handleLoginSubmit = async (values) => {
    const email = values.email.trim();
    const password = values.password.trim();

    if (!email || !password) {
      throw { validationErrors: { general: t('auth.login.errorRequired') } };
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
        <div className="auth-lang-toggle">
          <button className="btn-lang-toggle" onClick={toggleLang} aria-label={t('common.changeLang')}>
            {t('lang.toggle')}
          </button>
        </div>

        <div className="auth-card" role="main" aria-labelledby="login-title">
          <div className="auth-header">
            <h2 id="login-title">{t('auth.login.title')}</h2>
            <p>{t('auth.login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {(authError || errors.general || errors.submit) && (
              <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="error-message">
                {authError || errors.general || errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">{t('auth.login.emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder={t('auth.login.emailPlaceholder')}
                disabled={isFormDisabled}
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                data-testid="email-input"
              />
              {errors.email && (
                <span id="email-error" className="error-text" role="alert">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('auth.login.passwordLabel')}</label>
              <PasswordField
                id="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isFormDisabled}
                ariaInvalid={!!errors.password}
                ariaDescribedBy={errors.password ? 'password-error' : undefined}
                dataTestId="password-input"
                ariaRequired
              />
              {errors.password && (
                <span id="password-error" className="error-text" role="alert">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-100"
              disabled={isFormDisabled}
              aria-busy={isFormDisabled}
              data-testid="login-button"
            >
              {isFormDisabled ? t('auth.login.submitting') : t('auth.login.submit')}
            </button>
          </form>

          <div className="auth-footer">
            <p>{t('auth.login.noAccount')} <Link to="/register">{t('auth.login.registerLink')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
