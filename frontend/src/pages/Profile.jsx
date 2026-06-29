import { useEffect, useState } from 'react';
import userService from '../services/userService.js';
import authService from '../services/authService.js';
import { useSettings, SUPPORTED_CURRENCIES } from '../context/SettingsContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatDate } from '../utils/formatters.js';
import '../styles/pages/Expenses.css';
import '../styles/pages/Profile.css';

const Profile = () => {
  const { currency, setCurrency } = useSettings();
  const { t } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [profileValues, setProfileValues] = useState({ name: '', currency: 'USD' });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const response = await userService.getProfile();
        const data = response.data || response;
        setProfile(data);
        setProfileValues({ name: data.name || '', currency: data.currency || currency });
      } catch (err) {
        setLoadError(err.message || t('profile.errorLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    setProfileError('');

    if (!profileValues.name.trim() || profileValues.name.trim().length < 2) {
      setProfileError(t('profile.errorNameMin'));
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await userService.updateProfile({
        name: profileValues.name.trim(),
        currency: profileValues.currency,
      });
      const updated = response.data || response;
      setProfile(updated);
      setCurrency(updated.currency);

      // Sincronizar el nombre mostrado en el sidebar
      const storedUser = authService.getUser();
      if (storedUser) {
        localStorage.setItem(
          'authUser',
          JSON.stringify({ ...storedUser, name: updated.name, currency: updated.currency })
        );
      }

      setProfileMessage(t('profile.successProfile'));
    } catch (err) {
      setProfileError(
        err.validationErrors ? Object.values(err.validationErrors).join(' ') : err.message
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!passwordValues.currentPassword) {
      setPasswordError(t('profile.fieldCurrentPassword'));
      return;
    }

    if (passwordValues.newPassword.length < 8) {
      setPasswordError(t('profile.errorNameMin'));
      return;
    }

    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setPasswordError(t('profile.errorPasswordMismatch'));
      return;
    }

    setIsSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
      });
      setPasswordValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage(t('profile.successPassword'));
    } catch (err) {
      setPasswordError(
        err.validationErrors ? Object.values(err.validationErrors).join(' ') : err.message
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    setResetError('');
    setResetMessage('');
    try {
      await userService.resetAllData();
      setResetMessage(t('profile.successReset'));
      setShowResetConfirm(false);
    } catch (err) {
      setResetError(err.message || t('profile.errorLoad'));
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-container" data-testid="profile-loading">
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="profile-container">
        <div className="alert alert-error" role="alert" data-testid="profile-error">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="page-header">
        <h1>{t('profile.title')}</h1>
        <p className="subtitle">{t('profile.subtitle')}</p>
      </header>

      <div className="profile-grid">
        <section className="card profile-card" aria-labelledby="profile-info-title">
          <h3 id="profile-info-title">{t('profile.sectionPersonal')}</h3>

          {profileMessage && (
            <div className="alert alert-success" role="status" aria-live="polite" data-testid="profile-success">
              {profileMessage}
            </div>
          )}
          {profileError && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="profile-form-error">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} noValidate data-testid="profile-form">
            <div className="form-group">
              <label htmlFor="profile-name">{t('profile.fieldName')} *</label>
              <input
                id="profile-name"
                type="text"
                value={profileValues.name}
                onChange={(e) => setProfileValues((v) => ({ ...v, name: e.target.value }))}
                disabled={isSavingProfile}
                aria-required="true"
                data-testid="profile-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">{t('profile.fieldEmail')}</label>
              <input
                id="profile-email"
                type="email"
                value={profile?.email || ''}
                disabled
                readOnly
                aria-readonly="true"
                data-testid="profile-email"
              />
              <span className="hint-text">{t('profile.emailHint')}</span>
            </div>

            <div className="form-group">
              <label htmlFor="profile-currency">{t('profile.fieldCurrency')}</label>
              <select
                id="profile-currency"
                className="form-select"
                value={profileValues.currency}
                onChange={(e) => setProfileValues((v) => ({ ...v, currency: e.target.value }))}
                disabled={isSavingProfile}
                data-testid="profile-currency"
              >
                {SUPPORTED_CURRENCIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="hint-text">
                {t('profile.currencyHint')}
              </span>
            </div>

            {profile?.createdAt && (
              <p className="profile-meta" data-testid="profile-member-since">
                {t('profile.memberSince')}: {formatDate(profile.createdAt)}
              </p>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSavingProfile}
                aria-busy={isSavingProfile}
                data-testid="profile-save"
              >
                {isSavingProfile ? t('profile.savingProfile') : t('profile.saveProfile')}
              </button>
            </div>
          </form>
        </section>

        <section className="card profile-card" aria-labelledby="profile-password-title">
          <h3 id="profile-password-title">{t('profile.sectionPassword')}</h3>

          {passwordMessage && (
            <div className="alert alert-success" role="status" aria-live="polite" data-testid="password-success">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="password-error">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} noValidate data-testid="password-form">
            <div className="form-group">
              <label htmlFor="current-password">{t('profile.fieldCurrentPassword')} *</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={passwordValues.currentPassword}
                onChange={(e) =>
                  setPasswordValues((v) => ({ ...v, currentPassword: e.target.value }))
                }
                disabled={isSavingPassword}
                aria-required="true"
                data-testid="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">{t('profile.fieldNewPassword')} *</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={passwordValues.newPassword}
                onChange={(e) => setPasswordValues((v) => ({ ...v, newPassword: e.target.value }))}
                disabled={isSavingPassword}
                aria-required="true"
                data-testid="new-password"
              />
              <span className="hint-text">{t('profile.passwordMinHint')}</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">{t('profile.fieldConfirmPassword')} *</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={passwordValues.confirmPassword}
                onChange={(e) =>
                  setPasswordValues((v) => ({ ...v, confirmPassword: e.target.value }))
                }
                disabled={isSavingPassword}
                aria-required="true"
                data-testid="confirm-password"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSavingPassword}
                aria-busy={isSavingPassword}
                data-testid="password-save"
              >
                {isSavingPassword ? t('profile.savingPassword') : t('profile.savePassword')}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Danger Zone */}
      <section className="card profile-card profile-danger-zone" aria-labelledby="danger-zone-title">
        <h3 id="danger-zone-title" className="danger-title">{t('profile.sectionDanger')}</h3>
        <p className="danger-desc">
          {t('profile.resetDataDesc')}
        </p>

        {resetMessage && (
          <div className="alert alert-success" role="status" aria-live="polite">
            {resetMessage}
          </div>
        )}
        {resetError && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            {resetError}
          </div>
        )}

        {!showResetConfirm ? (
          <button
            type="button"
            className="btn-danger"
            onClick={() => { setShowResetConfirm(true); setResetMessage(''); setResetError(''); }}
            data-testid="reset-data-btn"
          >
            🗑️ {t('profile.resetButton')}
          </button>
        ) : (
          <div className="danger-confirm">
            <p className="danger-confirm-text">
              {t('profile.resetConfirmText')}
            </p>
            <div className="danger-confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                {t('profile.cancelReset')}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleResetData}
                disabled={isResetting}
                aria-busy={isResetting}
                data-testid="reset-data-confirm"
              >
                {isResetting ? '...' : t('profile.resetConfirmButton')}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
