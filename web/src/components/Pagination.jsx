import { useLanguage } from '../context/LanguageContext.jsx';

const Pagination = ({ page, totalPages, onPageChange, disabled = false }) => {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <div className="pagination" role="navigation" aria-label={t('pagination.nav')}>
      <button
        type="button"
        className="btn-secondary btn-filter"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label={t('pagination.prevLabel')}
      >
        {t('pagination.previous')}
      </button>
      <span className="pagination-info" aria-current="page" aria-label={t('pagination.current')}>
        {t('pagination.page')} {page} {t('pagination.of')} {totalPages}
      </span>
      <button
        type="button"
        className="btn-secondary btn-filter"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label={t('pagination.nextLabel')}
      >
        {t('pagination.next')}
      </button>
    </div>
  );
};

export default Pagination;
