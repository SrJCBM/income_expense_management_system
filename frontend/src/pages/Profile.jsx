import { useEffect, useState } from 'react';
import userService from '../services/userService.js';
import authService from '../services/authService.js';
import { useSettings, SUPPORTED_CURRENCIES } from '../context/SettingsContext.jsx';
import { formatDate } from '../utils/formatters.js';
import '../styles/pages/Expenses.css';
import '../styles/pages/Profile.css';

const Profile = () => {
  const { currency, setCurrency } = useSettings();

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
        setLoadError(err.message || 'Error al cargar el perfil');
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
      setProfileError('El nombre debe tener al menos 2 caracteres.');
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

      setProfileMessage('Perfil actualizado exitosamente.');
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
      setPasswordError('Ingresa tu contraseña actual.');
      return;
    }

    if (passwordValues.newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
      });
      setPasswordValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Contraseña actualizada exitosamente.');
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
      setResetMessage('Todos tus datos han sido eliminados.');
      setShowResetConfirm(false);
    } catch (err) {
      setResetError(err.message || 'Error al restablecer los datos.');
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
        <h1>Mi Perfil</h1>
        <p className="subtitle">Administra tu información personal y preferencias</p>
      </header>

      <div className="profile-grid">
        <section className="card profile-card" aria-labelledby="profile-info-title">
          <h3 id="profile-info-title">Información personal</h3>

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
              <label htmlFor="profile-name">Nombre *</label>
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
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={profile?.email || ''}
                disabled
                readOnly
                aria-readonly="true"
                data-testid="profile-email"
              />
              <span className="hint-text">El email no se puede modificar.</span>
            </div>

            <div className="form-group">
              <label htmlFor="profile-currency">Moneda preferida</label>
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
                Todos los montos de la aplicación se mostrarán en esta moneda.
              </span>
            </div>

            {profile?.createdAt && (
              <p className="profile-meta" data-testid="profile-member-since">
                Miembro desde: {formatDate(profile.createdAt)}
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
                {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </section>

        <section className="card profile-card" aria-labelledby="profile-password-title">
          <h3 id="profile-password-title">Cambiar contraseña</h3>

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
              <label htmlFor="current-password">Contraseña actual *</label>
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
              <label htmlFor="new-password">Nueva contraseña *</label>
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
              <span className="hint-text">Mínimo 8 caracteres.</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirmar nueva contraseña *</label>
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
                {isSavingPassword ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Zona de peligro */}
      <section className="card profile-card profile-danger-zone" aria-labelledby="danger-zone-title">
        <h3 id="danger-zone-title" className="danger-title">Zona de peligro</h3>
        <p className="danger-desc">
          Elimina todos tus gastos, ingresos, presupuestos y categorías de forma permanente.
          Esta acción no se puede deshacer.
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
            🗑️ Restablecer todos los datos
          </button>
        ) : (
          <div className="danger-confirm">
            <p className="danger-confirm-text">
              ¿Estás seguro? Se eliminarán <strong>todos</strong> tus registros financieros.
            </p>
            <div className="danger-confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleResetData}
                disabled={isResetting}
                aria-busy={isResetting}
                data-testid="reset-data-confirm"
              >
                {isResetting ? 'Eliminando...' : 'Sí, eliminar todo'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
