import { checkRules, strengthLevel, strengthLabel } from '../utils/passwordRules.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const BAR_COLORS = {
  weak:   '#f87171',
  fair:   '#fb923c',
  good:   '#facc15',
  strong: '#10b981',
};

const PasswordStrength = ({ password }) => {
  const { t } = useLanguage();

  if (!password) return null;

  const rules  = checkRules(password);
  const count  = strengthLevel(rules);
  const level  = strengthLabel(count);
  const color  = BAR_COLORS[level];

  return (
    <div className="password-strength" aria-live="polite">
      <div className="strength-bar" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="strength-segment"
            style={{ background: count >= i ? color : undefined }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color }}>
        {t(`password.strength.${level}`)}
      </span>
      <ul className="strength-rules" aria-label={t('common.passwordRequirements')}>
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={rule.met ? 'rule-met' : 'rule-unmet'}
            aria-label={`${rule.met ? t('common.ruleMet') : t('common.rulePending')}: ${t(`password.rules.${rule.key}`)}`}
          >
            <span aria-hidden="true">{rule.met ? '✓' : '✗'}</span>{' '}
            {t(`password.rules.${rule.key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
