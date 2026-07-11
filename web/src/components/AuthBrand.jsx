// frontend/src/components/AuthBrand.jsx
import { useLanguage } from '../context/LanguageContext.jsx';

const AuthBrand = ({ variant = 'login' }) => {
  const { t } = useLanguage();

  const VARIANTS = {
    login: {
      tagline: (
        <>
          {t('auth.brand.login.tagline1')}<br />{t('auth.brand.login.tagline2')}<em>{t('auth.brand.login.taglineEm')}</em>
        </>
      ),
      features: [
        t('auth.brand.login.feature1'),
        t('auth.brand.login.feature2'),
        t('auth.brand.login.feature3'),
      ],
      previewLabel: t('auth.brand.login.previewLabel'),
      previewAmount: { value: '+$3,240.00', color: '#10b981' },
      previewBars: [
        { label: t('auth.brand.login.bar1'), pct: '78%', color: '#10b981' },
        { label: t('auth.brand.login.bar2'), pct: '45%', color: '#f87171' },
      ],
    },
    register: {
      tagline: (
        <>
          {t('auth.brand.register.tagline1')}<br /><em>{t('auth.brand.register.taglineEm')}</em>
        </>
      ),
      features: [
        t('auth.brand.register.feature1'),
        t('auth.brand.register.feature2'),
        t('auth.brand.register.feature3'),
      ],
      previewLabel: t('auth.brand.register.previewLabel'),
      previewAmount: { value: '$1,850.00', color: '#f87171' },
      previewBars: [
        { label: t('auth.brand.register.bar1'), pct: '62%', color: '#6366f1' },
        { label: t('auth.brand.register.bar2'), pct: '34%', color: '#ec4899' },
        { label: t('auth.brand.register.bar3'), pct: '20%', color: '#f59e0b' },
      ],
    },
  };

  const v = VARIANTS[variant];

  return (
    <aside className="auth-brand" aria-hidden="true">
      <div className="auth-brand-content">
        <div className="auth-brand-logo">
          <div className="auth-brand-icon">💎</div>
          <span className="auth-brand-name">Finance<span>App</span></span>
        </div>

        <h1 className="auth-brand-tagline">{v.tagline}</h1>

        <ul className="auth-brand-features">
          {v.features.map((f) => (
            <li key={f}>
              <span className="auth-feature-dot" />
              {f}
            </li>
          ))}
        </ul>

        <div className="auth-preview-card">
          <p className="auth-preview-label">{v.previewLabel}</p>
          <p className="auth-preview-amount" style={{ color: v.previewAmount.color }}>
            {v.previewAmount.value}
          </p>
          <div className="auth-preview-bars">
            {v.previewBars.map((bar) => (
              <div key={bar.label} className="auth-preview-bar-row">
                <span>{bar.label}</span>
                <div className="auth-preview-bar-track">
                  <div className="auth-preview-bar-fill" style={{ width: bar.pct, background: bar.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AuthBrand;
