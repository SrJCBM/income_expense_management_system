import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import useNetworkStatus from '../hooks/useNetworkStatus.js';
import offlineQueueService, {
  OFFLINE_QUEUE_CHANGE_EVENT,
} from '../services/offlineQueueService.js';

const ConnectionStatusCard = ({ compact = false }) => {
  const { t } = useLanguage();
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const refreshCount = async () => {
      try {
        const count = await offlineQueueService.countPending();
        setPendingCount(count);
      } catch {
        setPendingCount(0);
      }
    };

    refreshCount();
    window.addEventListener(OFFLINE_QUEUE_CHANGE_EVENT, refreshCount);

    return () => {
      window.removeEventListener(OFFLINE_QUEUE_CHANGE_EVENT, refreshCount);
    };
  }, []);

  const statusLabel = isOnline ? t('offline.onlineBadge') : t('offline.offlineBadge');

  if (compact) {
    return (
      <div className={`connection-pill ${isOnline ? 'connection-online' : 'connection-offline'}`} title={statusLabel}>
        <span className="connection-dot" aria-hidden="true" />
        <span>{statusLabel}</span>
        {pendingCount > 0 && <strong>{pendingCount}</strong>}
      </div>
    );
  }

  return (
    <div className={`connection-card ${isOnline ? 'connection-online' : 'connection-offline'}`}>
      <span className="connection-label">{t('offline.connectionLabel')}</span>
      <div className="connection-state">
        <span className="connection-dot" aria-hidden="true" />
        <strong>{statusLabel}</strong>
      </div>
      {pendingCount > 0 && (
        <span className="connection-pending">
          {t('offline.pendingCount').replace('{{count}}', pendingCount)}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatusCard;
