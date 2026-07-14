import { useEffect, useState } from 'react';
import { useBudgets } from '../hooks/useBudgets.js';
import { useCategories } from '../hooks/useCategories.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getMonthName } from '../utils/formatters.js';
import { parseAmount } from '../utils/parseAmount.js';
import '../styles/pages/Expenses.css';
import '../styles/pages/Budgets.css';

const getCurrentPeriod = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

const emptyForm = { categoryId: '', limitAmount: '', alertThreshold: '80' };

const Budgets = () => {
  const { t } = useLanguage();
  const { budgets, isLoading, error, fetchBudgets, addBudget, updateBudget, removeBudget } = useBudgets();
  const { categories, fetchCategories } = useCategories();
  const { formatCurrency } = useSettings();

  const [period, setPeriod] = useState(getCurrentPeriod());
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBudgets(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.month, period.year]);

  useEffect(() => {
    fetchCategories('expense');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodChange = (event) => {
    const [year, month] = event.target.value.split('-').map(Number);
    if (year && month) {
      setPeriod({ month, year });
    }
  };

  const periodInputValue = `${period.year}-${String(period.month).padStart(2, '0')}`;

  const openCreateForm = () => {
    setSuccessMessage('');
    setFormError('');
    setEditingBudget(null);
    setFormValues(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (budget) => {
    setSuccessMessage('');
    setFormError('');
    setEditingBudget(budget);
    setFormValues({
      categoryId: budget.categoryId || '',
      limitAmount: String(budget.limitAmount ?? ''),
      alertThreshold: String(budget.alertThreshold ?? 80),
    });
    setShowForm(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formValues.categoryId) {
      setFormError(t('budgets.fieldCategoryRequired'));
      return;
    }

    const limitNumber = parseAmount(formValues.limitAmount);
    if (Number.isNaN(limitNumber) || limitNumber <= 0) {
      setFormError(Number.isNaN(limitNumber) ? t('budgets.errorLimitFormat') : t('budgets.errorAmount'));
      return;
    }

    const payload = {
      categoryId: formValues.categoryId,
      limitAmount: limitNumber,
      alertThreshold: Number(formValues.alertThreshold) || 80,
      month: period.month,
      year: period.year,
    };

    setIsSubmitting(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, payload);
        setSuccessMessage(t('budgets.successEdit'));
      } else {
        await addBudget(payload);
        setSuccessMessage(t('budgets.successCreate'));
      }
      setShowForm(false);
      setEditingBudget(null);
    } catch (err) {
      setFormError(
        err.validationErrors
          ? Object.values(err.validationErrors).join(' ')
          : err.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (budget) => {
    if (!window.confirm(t('budgets.confirmDelete'))) {
      return;
    }

    try {
      await removeBudget(budget.id);
      setSuccessMessage(t('budgets.successDelete'));
    } catch {
      // El error ya se expone por el hook en la UI
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormError('');
  };

  const getProgressState = (budget) => {
    if (budget.isOverBudget) return 'over';
    if (budget.isNearLimit) return 'warning';
    return 'ok';
  };

  return (
    <div className="budgets-container">
      <header className="page-header flex-between">
        <div>
          <h1>{t('budgets.title')}</h1>
          <p className="subtitle">{t('budgets.subtitle')}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={openCreateForm}
          disabled={showForm}
          data-testid="new-budget-button"
        >
          {t('budgets.newButton')}
        </button>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {!showForm && (
        <div className="filters-bar" data-testid="budget-filters">
          <label htmlFor="budget-period" className="filter-label">{t('budgets.period')}</label>
          <input
            id="budget-period"
            type="month"
            value={periodInputValue}
            onChange={handlePeriodChange}
            data-testid="budget-period"
            aria-label={t('budgets.selectPeriodLabel')}
          />
        </div>
      )}

      {showForm ? (
        <div className="card form-card">
          <h3>{editingBudget ? t('budgets.formTitleEdit') : t('budgets.formTitleCreate')}</h3>

          {formError && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="budget-error">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate data-testid="budget-form">
            <div className="form-group">
              <label htmlFor="budget-category">{t('budgets.fieldCategoryExpense')} *</label>
              <select
                id="budget-category"
                name="categoryId"
                value={formValues.categoryId}
                onChange={handleFormChange}
                className="form-select"
                disabled={isSubmitting || Boolean(editingBudget)}
                aria-required="true"
                data-testid="budget-category"
              >
                <option value="">{t('budgets.fieldCategoryDefault')}</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id || category._id} value={category.id || category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget-limit">{t('budgets.fieldLimitAmount')} *</label>
                <input
                  id="budget-limit"
                  type="text"
                  inputMode="decimal"
                  name="limitAmount"
                  value={formValues.limitAmount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-required="true"
                  data-testid="budget-limit"
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget-threshold">{t('budgets.fieldThreshold')}</label>
                <input
                  id="budget-threshold"
                  type="number"
                  name="alertThreshold"
                  value={formValues.alertThreshold}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
                  step="1"
                  disabled={isSubmitting}
                  data-testid="budget-threshold"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                data-testid="budget-cancel"
              >
                {t('budgets.cancelButton')}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                data-testid="budget-submit"
              >
                {isSubmitting
                  ? t('budgets.submitting')
                  : editingBudget
                    ? t('budgets.submitEdit')
                    : t('budgets.submitCreate')}
              </button>
            </div>
          </form>
        </div>
      ) : isLoading ? (
        <div data-testid="budget-loading">
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
        </div>
      ) : error ? (
        <div className="alert alert-error" role="alert" data-testid="budget-list-error">
          {t('budgets.errorLoad')}{error}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card list-card">
          <div className="empty-state" data-testid="budget-empty">
            <div className="empty-icon">🎯</div>
            <h3>{t('budgets.emptyTitle')}</h3>
            <p className="hint">{t('budgets.emptyHint')}</p>
          </div>
        </div>
      ) : (
        <div className="budget-grid" data-testid="budget-list">
          {budgets.map((budget) => {
            const state = getProgressState(budget);
            const percentage = Math.min(budget.percentageUsed ?? 0, 100);
            const categoryName = budget.category?.name || t('budgets.noCategory');

            return (
              <article key={budget.id} className={`budget-card budget-${state}`} data-testid="budget-item">
                <header className="budget-card-header">
                  <span
                    className="budget-category-dot"
                    style={{ backgroundColor: budget.category?.color || 'var(--primary-color)' }}
                    aria-hidden="true"
                  ></span>
                  <h3 className="budget-category-name">{categoryName}</h3>
                  <div className="actions-cell">
                    <button
                      type="button"
                      className="btn-icon btn-edit"
                      onClick={() => openEditForm(budget)}
                      title={t('budgets.editBudgetTitle')}
                      aria-label={`${t('budgets.editBudgetTitle')} ${categoryName}`}
                      data-testid="edit-budget"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(budget)}
                      title={t('budgets.deleteBudgetTitle')}
                      aria-label={`${t('budgets.deleteBudgetTitle')} ${categoryName}`}
                      data-testid="delete-budget"
                    >
                      🗑️
                    </button>
                  </div>
                </header>

                <div
                  className="budget-progress"
                  role="progressbar"
                  aria-valuenow={budget.percentageUsed ?? 0}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${t('budgets.progressLabel')} ${categoryName}`}
                >
                  <div className="budget-progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>

                <div className="budget-amounts">
                  <span data-testid="budget-spent">
                    {t('budgets.spent')}: <strong>{formatCurrency(budget.spentAmount)}</strong>
                  </span>
                  <span data-testid="budget-limit-amount">
                    {t('budgets.colLimit')}: <strong>{formatCurrency(budget.limitAmount)}</strong>
                  </span>
                </div>

                <p className="budget-status" data-testid="budget-status">
                  {budget.isOverBudget
                    ? `${t('budgets.statusOver')} ${formatCurrency(budget.spentAmount - budget.limitAmount)}`
                    : budget.isNearLimit
                      ? `${t('budgets.statusNear')} (${budget.percentageUsed}%)`
                      : `${t('budgets.statusAvailable')}: ${formatCurrency(budget.remainingAmount)} (${budget.percentageUsed}% ${t('budgets.statusUsed')})`}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budgets;
