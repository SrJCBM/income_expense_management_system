const VARIANTS = {
  login: {
    tagline: (
      <>
        Cada peso<br />con <em>propósito</em>
      </>
    ),
    features: [
      'Registra ingresos y gastos al instante',
      'Presupuestos con alertas en tiempo real',
      'Reportes y análisis visuales del mes',
    ],
    previewLabel: 'Balance del mes',
    previewAmount: { value: '+$3,240.00', color: '#10b981' },
    previewBars: [
      { label: 'Ingresos', pct: '78%', color: '#10b981' },
      { label: 'Gastos',   pct: '45%', color: '#f87171' },
    ],
  },
  register: {
    tagline: (
      <>
        Empieza hoy.<br /><em>Sin excusas.</em>
      </>
    ),
    features: [
      'Configura tu moneda preferida desde el inicio',
      'Categorías personalizables con colores e íconos',
      'Exporta tus datos a PDF o Excel cuando quieras',
    ],
    previewLabel: 'Gastos por categoría',
    previewAmount: { value: '$1,850.00', color: '#f87171' },
    previewBars: [
      { label: 'Vivienda',    pct: '62%', color: '#6366f1' },
      { label: 'Comida',      pct: '34%', color: '#ec4899' },
      { label: 'Transporte',  pct: '20%', color: '#f59e0b' },
    ],
  },
};

const AuthBrand = ({ variant = 'login' }) => {
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
                  <div
                    className="auth-preview-bar-fill"
                    style={{ width: bar.pct, background: bar.color }}
                  />
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
