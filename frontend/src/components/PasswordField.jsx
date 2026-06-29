import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

const PasswordField = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = '',
  ariaInvalid = false,
  ariaDescribedBy,
  dataTestId,
  ariaRequired = false,
}) => {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  return (
    <div className="password-field-wrapper">
      <input
        type={show ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        data-testid={dataTestId || undefined}
        required={ariaRequired || undefined}
        aria-required={ariaRequired || undefined}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t('password.hideLabel') : t('password.showLabel')}
        tabIndex={-1}
        disabled={disabled}
      >
        {show ? '🙈' : '👁'}
      </button>
    </div>
  );
};

export default PasswordField;
