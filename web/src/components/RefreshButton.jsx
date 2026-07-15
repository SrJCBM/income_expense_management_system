import { useLanguage } from '../context/LanguageContext.jsx';
import '../styles/components/RefreshButton.css';

const RefreshButton = ({ onRefresh, isRefreshing = false, disabled = false }) => {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="btn-secondary refresh-button"
      onClick={onRefresh}
      disabled={disabled || isRefreshing}
      aria-busy={isRefreshing}
      aria-label={isRefreshing ? t('common.refreshingData') : t('common.refreshData')}
      data-testid="refresh-button"
    >
      {isRefreshing ? t('common.refreshing') : t('common.refresh')}
    </button>
  );
};

export default RefreshButton;
