import { toDateInputValue } from '../utils/dateUtils.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const getCategoryName = (categories, categoryId, fallback) => {
  const category = categories.find((item) => (item.id || item._id) === categoryId);
  return category?.name || fallback;
};

const PendingSyncList = ({
  items,
  categories = [],
  isOnline,
  isSyncing,
  formatCurrency,
  onSyncAll,
  onRetry,
  onEdit,
  onDiscard,
}) => {
  const { t } = useLanguage();

  if (!items.length) return null;

  return (
    <section className="pending-sync-card" aria-live="polite" data-testid="pending-sync-list">
      <div className="pending-sync-header">
        <div>
          <p className="pending-sync-kicker">{t('offline.kicker')}</p>
          <h3>{t('offline.title')} ({items.length})</h3>
        </div>
        <button
          type="button"
          className="btn-primary pending-sync-button"
          onClick={onSyncAll}
          disabled={!isOnline || isSyncing}
          data-testid="sync-pending-button"
        >
          {isSyncing ? t('offline.syncing') : t('offline.syncAll')}
        </button>
      </div>

      <div className="pending-sync-list">
        {items.map((item) => {
          const categoryName = getCategoryName(categories, item.payload.categoryId, t('offline.noCategory'));
          return (
            <article
              key={item.localId}
              className={`pending-sync-item pending-sync-item-${item.status}`}
              data-testid="pending-sync-item"
            >
              <div className="pending-sync-main">
                <div>
                  <strong>{item.payload.concept || item.payload.description}</strong>
                  <p>
                    {toDateInputValue(item.payload.date)} · {categoryName}
                  </p>
                </div>
                <span className="pending-sync-amount">
                  {formatCurrency(item.payload.amount)}
                </span>
              </div>

              <div className="pending-sync-meta">
                <span className={`pending-status pending-status-${item.status}`}>
                  {item.status === 'failed'
                    ? t('offline.failed')
                    : item.status === 'syncing'
                      ? t('offline.syncing')
                      : t('offline.pending')}
                </span>
                {item.error && <span className="pending-error">{item.error}</span>}
              </div>

              <div className="pending-sync-actions">
                <button type="button" className="btn-secondary" onClick={() => onEdit(item)} disabled={isSyncing}>
                  {t('offline.edit')}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onRetry(item)}
                  disabled={!isOnline || isSyncing}
                >
                  {t('offline.retry')}
                </button>
                <button type="button" className="btn-secondary btn-danger-soft" onClick={() => onDiscard(item)} disabled={isSyncing}>
                  {t('offline.discard')}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PendingSyncList;
