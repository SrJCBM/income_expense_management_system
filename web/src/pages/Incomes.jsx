import { useEffect, useState, useRef } from 'react';
import { useIncomes } from '../hooks/useIncomes.js';
import { useForm } from '../hooks/useForm.js';
import Pagination from '../components/Pagination.jsx';
import PendingSyncList from '../components/PendingSyncList.jsx';
import categoryService from '../services/categoryService.js';
import { getTodayInputValue, toDateInputValue, toLocalNoonISOString } from '../utils/dateUtils.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import useNetworkStatus from '../hooks/useNetworkStatus.js';
import useOfflineQueue from '../hooks/useOfflineQueue.js';
import isNetworkError from '../utils/networkErrors.js';
import { parseAmount } from '../utils/parseAmount.js';
import '../styles/pages/Expenses.css';

const STORAGE_KEY = 'incomes_filters';

const loadSavedFilters = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

const Incomes = () => {
  const {
    incomes,
    pagination,
    isLoading,
    error,
    fetchIncomes,
    addIncome,
    updateIncome,
    removeIncome,
  } = useIncomes();

  const { formatCurrency } = useSettings();
  const { t } = useLanguage();
  const { isOnline } = useNetworkStatus();
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingPendingItem, setEditingPendingItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const {
    pendingItems,
    isSyncing,
    queueError,
    enqueueCreate,
    updatePending,
    discardPending,
    retryPending,
    syncAll,
  } = useOfflineQueue('income');

  const saved = loadSavedFilters();
  const [searchFilter, setSearchFilter]     = useState(saved?.searchFilter || '');
  const [categoryFilter, setCategoryFilter] = useState(saved?.categoryFilter || '');
  const [monthFilter, setMonthFilter]       = useState(saved?.monthFilter || '');

  const activeFiltersRef = useRef({});

  const buildFilters = (page = 1) => {
    const filters = { page };
    if (searchFilter.trim()) filters.search = searchFilter.trim();
    if (categoryFilter) filters.category = categoryFilter;
    if (monthFilter) {
      const [year, month] = String(monthFilter).split('-').map(Number);
      if (year && month) {
        filters.year = year;
        filters.month = month;
      }
    }
    return filters;
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    const filters = buildFilters(1);
    activeFiltersRef.current = filters;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ searchFilter, categoryFilter, monthFilter }));
    fetchIncomes(filters);
  };

  const handleClearFilters = () => {
    setSearchFilter('');
    setCategoryFilter('');
    setMonthFilter('');
    setCurrentPage(1);
    sessionStorage.removeItem(STORAGE_KEY);
    activeFiltersRef.current = { page: 1 };
    fetchIncomes({ page: 1 });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const filters = { ...activeFiltersRef.current, page: newPage };
    activeFiltersRef.current = filters;
    fetchIncomes(filters);
  };

  const loadIncomeCategories = async () => {
    setCategoriesError(null);
    setCategoriesLoading(true);
    try {
      const response = await categoryService.getCategories('income');
      setCategories(response?.data || []);
    } catch (err) {
      setCategoriesError(err.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    const filters = buildFilters(1);
    activeFiltersRef.current = filters;
    fetchIncomes(filters);
    loadIncomeCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIncomeSubmit = async (values) => {
    if (!values.concept || !values.amount || !values.date || !values.categoryId) {
      throw { validationErrors: { general: t('incomes.errorRequired') } };
    }

    const amountNumber = parseAmount(values.amount);
    if (Number.isNaN(amountNumber)) {
      throw { validationErrors: { amount: t('incomes.errorAmountFormat') } };
    }
    if (amountNumber <= 0) {
      throw { validationErrors: { amount: t('incomes.errorAmount') } };
    }

    const payload = {
      concept: values.concept,
      amount: amountNumber,
      date: toLocalNoonISOString(values.date),
      categoryId: values.categoryId,
      notes: values.notes,
    };

    if (editingPendingItem) {
      await updatePending(editingPendingItem.localId, payload);
      setSuccessMessage(t('offline.successPendingEdit'));
    } else if (editingIncome) {
      await updateIncome(editingIncome.id || editingIncome._id, payload);
      setSuccessMessage(t('incomes.successEdit'));
    } else if (!isOnline) {
      await enqueueCreate(payload);
      setSuccessMessage(t('offline.savedIncome'));
    } else {
      try {
        await addIncome(payload);
        setSuccessMessage(t('incomes.successCreate'));
      } catch (err) {
        if (!isNetworkError(err)) {
          throw err;
        }
        await enqueueCreate(payload);
        setSuccessMessage(t('offline.savedIncome'));
      }
    }

    setShowForm(false);
    resetForm();
    setEditingIncome(null);
    setEditingPendingItem(null);
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setFieldValue } = useForm(
    { concept: '', amount: '', date: getTodayInputValue(), categoryId: '', notes: '' },
    handleIncomeSubmit
  );

  const handleShowCreateForm = () => {
    if (successMessage) setSuccessMessage('');
    resetForm();
    setEditingIncome(null);
    setEditingPendingItem(null);
    setShowForm(true);
  };

  const handleEdit = (income) => {
    if (successMessage) setSuccessMessage('');
    setEditingIncome(income);
    setEditingPendingItem(null);
    setFieldValue('concept', income.concept || income.description || '');
    setFieldValue('amount', income.amount || '');
    setFieldValue('date', toDateInputValue(income.date));
    setFieldValue('categoryId', income.categoryId || income.category?._id || income.category?.id || income.category || '');
    setFieldValue('notes', income.notes || '');
    setShowForm(true);
  };

  const handleDuplicate = (income) => {
    if (successMessage) setSuccessMessage('');
    setEditingIncome(null);
    setEditingPendingItem(null);
    setFieldValue('concept', income.concept || income.description || '');
    setFieldValue('amount', income.amount || '');
    setFieldValue('date', getTodayInputValue());
    setFieldValue('categoryId', income.categoryId || income.category?._id || income.category?.id || income.category || '');
    setFieldValue('notes', income.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (incomeId) => {
    if (!window.confirm(t('incomes.confirmDelete'))) return;
    try {
      await removeIncome(incomeId);
      setSuccessMessage(t('incomes.successDelete'));
    } catch {
      // El error ya se expone por el hook en la UI
    }
  };

  const handleEditPending = (item) => {
    if (successMessage) setSuccessMessage('');
    setEditingIncome(null);
    setEditingPendingItem(item);
    setFieldValue('concept', item.payload.concept || item.payload.description || '');
    setFieldValue('amount', item.payload.amount || '');
    setFieldValue('date', toDateInputValue(item.payload.date));
    setFieldValue('categoryId', item.payload.categoryId || item.payload.category || '');
    setFieldValue('notes', item.payload.notes || '');
    setShowForm(true);
  };

  const handleDiscardPending = async (item) => {
    if (!window.confirm(t('offline.confirmDiscard'))) return;
    await discardPending(item.localId);
    setSuccessMessage(t('offline.successDiscard'));
  };

  const handleRetryPending = async (item) => {
    await retryPending(item, addIncome);
    fetchIncomes(activeFiltersRef.current);
  };

  const handleSyncAll = async () => {
    await syncAll(addIncome);
    fetchIncomes(activeFiltersRef.current);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setEditingIncome(null);
    setEditingPendingItem(null);
  };

  return (
    <div className="expenses-container">
      <header className="page-header flex-between">
        <div>
          <h1>{t('incomes.title')}</h1>
          <p className="subtitle">{t('incomes.subtitle')}</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleShowCreateForm}
          disabled={showForm}
          data-testid="new-income-button"
        >
          {t('incomes.newButton')}
        </button>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {queueError && (
        <div className="alert alert-error" role="alert">
          {queueError}
        </div>
      )}

      {!showForm && (
        <div className="filters-bar" data-testid="income-filters">
          <input
            type="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder={t('incomes.searchPlaceholder')}
            className="filter-search"
            data-testid="income-filter-search"
            aria-label={t('incomes.searchLabel')}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            data-testid="income-filter-category"
            aria-label={t('incomes.filterCategoryLabel')}
          >
            <option value="">{t('incomes.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            data-testid="income-filter-month"
            aria-label={t('incomes.filterMonthLabel')}
          />
          <button
            type="button"
            className="btn-secondary btn-filter"
            onClick={handleApplyFilters}
            data-testid="income-apply-filters"
          >
            {t('incomes.filterButton')}
          </button>
          <button
            type="button"
            className="btn-secondary btn-filter"
            onClick={handleClearFilters}
            data-testid="income-clear-filters"
          >
            {t('incomes.clearButton')}
          </button>
        </div>
      )}

      {showForm ? (
        <div className="card form-card">
          <h3>{editingIncome || editingPendingItem ? t('incomes.formTitleEdit') : t('incomes.formTitleCreate')}</h3>

          {errors.general && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="income-error-general">
              {errors.general}
            </div>
          )}
          {errors.submit && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="income-error-general">
              {errors.submit}
            </div>
          )}
          {categoriesError && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              {categoriesError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate data-testid="income-form">
            <div className="form-group">
              <label htmlFor="income-concept">{t('incomes.fieldConcept')} *</label>
              <input
                id="income-concept"
                type="text"
                name="concept"
                value={values.concept}
                onChange={handleChange}
                placeholder={t('incomes.fieldConceptPlaceholder')}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.concept}
                aria-describedby={errors.concept ? 'concept-error' : undefined}
                data-testid="income-concept"
              />
              {errors.concept && <span id="concept-error" className="error-text" role="alert" data-testid="income-error-concept">{errors.concept}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="income-amount">{t('incomes.fieldAmount')} *</label>
                <input
                  id="income-amount"
                  type="text"
                  inputMode="decimal"
                  name="amount"
                  value={values.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                  data-testid="income-amount"
                />
                {errors.amount && <span id="amount-error" className="error-text" role="alert" data-testid="income-error-amount">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="income-date">{t('incomes.fieldDate')} *</label>
                <input
                  id="income-date"
                  type="date"
                  name="date"
                  value={values.date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? 'date-error' : undefined}
                  data-testid="income-date"
                />
                {errors.date && <span id="date-error" className="error-text" role="alert" data-testid="income-error-date">{errors.date}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="income-category">{t('incomes.fieldCategory')} *</label>
              <select
                id="income-category"
                name="categoryId"
                value={values.categoryId}
                onChange={handleChange}
                className="form-select"
                disabled={isSubmitting || categoriesLoading}
                aria-required="true"
                aria-invalid={!!errors.categoryId}
                aria-describedby={errors.categoryId ? 'category-error' : undefined}
                data-testid="income-category"
              >
                <option value="">{categoriesLoading ? t('incomes.loadingCategories') : t('incomes.fieldCategoryDefault')}</option>
                {categories.map((category) => (
                  <option key={category.id || category._id} value={category.id || category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span id="category-error" className="error-text" role="alert" data-testid="income-error-category">{errors.categoryId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="income-notes">{t('incomes.fieldNotes')}</label>
              <textarea
                id="income-notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                placeholder={t('incomes.fieldNotesPlaceholder')}
                className="form-textarea"
                disabled={isSubmitting}
                data-testid="income-notes"
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                data-testid="income-cancel"
              >
                {t('incomes.cancelButton')}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                data-testid="income-submit"
              >
                {isSubmitting ? t('incomes.submitting') : editingIncome || editingPendingItem ? t('incomes.submitEdit') : t('incomes.submitCreate')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <PendingSyncList
            items={pendingItems}
            categories={categories}
            isOnline={isOnline}
            isSyncing={isSyncing}
            formatCurrency={formatCurrency}
            onSyncAll={handleSyncAll}
            onRetry={handleRetryPending}
            onEdit={handleEditPending}
            onDiscard={handleDiscardPending}
          />
        <div className="card list-card">
          {isLoading ? (
            <div className="skeleton-item"></div>
          ) : error ? (
            <div className="alert alert-error">{t('incomes.errorLoad')} {error}</div>
          ) : incomes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>{t('incomes.emptyTitle')}</h3>
              <p className="hint">{t('incomes.emptyHint')}</p>
            </div>
          ) : (
          <div className="table-scroll">
            <table className="data-table" data-testid="income-list">
              <thead>
                <tr>
                  <th>{t('incomes.colDate')}</th>
                  <th>{t('incomes.colConcept')}</th>
                  <th>{t('incomes.colCategory')}</th>
                  <th>{t('incomes.colAmount')}</th>
                  <th>{t('incomes.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => {
                  const incomeId = income.id || income._id;
                  return (
                    <tr key={incomeId} data-testid="income-item">
                      <td data-label={t('incomes.colDate')}>{toDateInputValue(income.date)}</td>
                      <td data-label={t('incomes.colConcept')}>{income.concept}</td>
                      <td data-label={t('incomes.colCategory')}>{income.category?.name || t('incomes.noCategory')}</td>
                      <td className="amount positive" data-label={t('incomes.colAmount')}>+{formatCurrency(income.amount)}</td>
                      <td className="actions-cell" data-label={t('incomes.colActions')}>
                        <button className="btn-icon" onClick={() => handleEdit(income)} title={t('incomes.editTitle')} data-testid="edit-income">✏️</button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDuplicate(income)}
                          title={t('incomes.duplicateTitle')}
                          aria-label={`${t('incomes.duplicateLabel')}: ${income.concept}`}
                          data-testid="duplicate-income"
                        >
                          📋
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(incomeId)} title={t('incomes.deleteTitle')} data-testid="delete-income">🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        </div>
        </>
      )}

      {!showForm && categoriesError && (
        <div className="alert alert-error">{categoriesError}</div>
      )}

      {!showForm && !categoriesError && !categoriesLoading && categories.length === 0 && (
        <div className="card list-card">
          <p className="hint">{t('incomes.noCategoriesHint')}</p>
        </div>
      )}
    </div>
  );
};

export default Incomes;
