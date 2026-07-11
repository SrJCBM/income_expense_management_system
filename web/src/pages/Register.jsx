// frontend/src/pages/Register.jsx
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { checkRules } from '../utils/passwordRules.js';
import AuthBrand from '../components/AuthBrand.jsx';
import PasswordField from '../components/PasswordField.jsx';
import PasswordStrength from '../components/PasswordStrength.jsx';
import '../styles/Auth.css';

const Register = () => {
  const { register, isLoading, error: authError } = useAuth();
  const { t, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (values) => {
    const trimmedName = values.name.trim();

    if (!trimmedName || !values.email.trim() || !values.password.trim()) {
      throw { validationErrors: { general: t('auth.register.errorRequired') } };
    }

    if (!/[A-Za-z]/.test(trimmedName)) {
      throw { validationErrors: { name: t('auth.register.errorNameInvalid') } };
    }

    if (values.password !== values.confirmPassword) {
      throw { validationErrors: { confirmPassword: t('auth.register.errorPasswordMismatch') } };
    }

    const allMet = checkRules(values.password).every((r) => r.met);
    if (!allMet) {
      throw { validationErrors: { password: t('password.errorWeak') } };
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
      <AuthBrand variant="register" />

      <div className="auth-form-side">
        <div className="auth-lang-toggle">
          <button className="btn-lang-toggle" onClick={toggleLang} aria-label={t('common.changeLang')}>
            {t('lang.toggle')}
          </button>
        </div>

        <div className="auth-card" role="main" aria-labelledby="register-title">
          <div className="auth-header">
            <h2 id="register-title">{t('auth.register.title')}</h2>
            <p>{t('auth.register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {(authError || errors.general || errors.submit) && (
              <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="error-message">
                {authError || errors.general || errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">{t('auth.register.nameLabel')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder={t('auth.register.namePlaceholder')}
                disabled={isFormDisabled}
                required
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                data-testid="name-input"
              />
              {errors.name && (
                <span id="name-error" className="error-text" role="alert" data-testid="register-error-name">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('auth.register.emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder={t('auth.register.emailPlaceholder')}
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
              <label htmlFor="password">{t('auth.register.passwordLabel')}</label>
              <PasswordField
                id="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder={t('auth.register.passwordPlaceholder')}
                disabled={isFormDisabled}
                ariaInvalid={!!errors.password}
                ariaDescribedBy={errors.password ? 'password-error' : undefined}
                dataTestId="password-input"
                ariaRequired
              />
              <PasswordStrength password={values.password} />
              {errors.password && (
                <span id="password-error" className="error-text" role="alert" data-testid="register-error-password">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.register.confirmLabel')}</label>
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.register.confirmPlaceholder')}
                disabled={isFormDisabled}
                ariaInvalid={!!errors.confirmPassword}
                ariaDescribedBy={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                dataTestId="confirm-password-input"
                ariaRequired
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
              {isFormDisabled ? t('auth.register.submitting') : t('auth.register.submit')}
            </button>
          </form>

          <div className="auth-footer">
            <p>{t('auth.register.hasAccount')} <Link to="/login">{t('auth.register.loginLink')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
