import { useState, useEffect, useRef } from 'react';
import expenseService from '../services/expenseService.js';
import { getTodayInputValue, toLocalNoonISOString } from '../utils/dateUtils.js';
import { useExpenses } from '../hooks/useExpenses.js';
import ExpenseList from '../components/ExpenseList.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import Pagination from '../components/Pagination.jsx';
import PendingSyncList from '../components/PendingSyncList.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import useNetworkStatus from '../hooks/useNetworkStatus.js';
import useOfflineQueue from '../hooks/useOfflineQueue.js';
import isNetworkError from '../utils/networkErrors.js';
import '../styles/pages/Expenses.css';

const STORAGE_KEY = 'expenses_filters';

const loadSavedFilters = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

const Expenses = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useSettings();
  const { isOnline } = useNetworkStatus();
  const { expenses, pagination, isLoading, error, fetchExpenses, addExpense, updateExpense, removeExpense } = useExpenses();
  const [showForm, setShowForm]             = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingPendingItem, setEditingPendingItem] = useState(null);
  const [duplicatingExpense, setDuplicatingExpense] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage]       = useState(1);
  const [recurringSuggestions, setRecurringSuggestions] = useState([]);

  const saved = loadSavedFilters();
  const [categoryFilter, setCategoryFilter]     = useState(saved?.categoryFilter || '');
  const [monthFilter, setMonthFilter]           = useState(saved?.monthFilter || '');
  const [searchFilter, setSearchFilter]         = useState(saved?.searchFilter || '');
  const [minAmountFilter, setMinAmountFilter]   = useState(saved?.minAmountFilter || '');
  const [maxAmountFilter, setMaxAmountFilter]   = useState(saved?.maxAmountFilter || '');
  const [sortOrder, setSortOrder]               = useState(saved?.sortOrder || 'date-desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { categories, fetchCategories } = useCategories();
  const {
    pendingItems,
    isSyncing,
    queueError,
    enqueueCreate,
    updatePending,
    discardPending,
    retryPending,
    syncAll,
  } = useOfflineQueue('expense');

  const activeFiltersRef = useRef({});

  const buildFilters = (page = 1) => {
    const filters = { page };
    if (categoryFilter) filters.category = categoryFilter;
    if (monthFilter) {
      const parts = String(monthFilter).split('-');
      if (parts.length === 2) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          filters.year = year;
          filters.month = month;
        }
      }
    }
    if (searchFilter.trim()) filters.search = searchFilter.trim();
    if (minAmountFilter) filters.minAmount = minAmountFilter;
    if (maxAmountFilter) filters.maxAmount = maxAmountFilter;
    if (sortOrder) filters.sort = sortOrder;
    return filters;
  };

  useEffect(() => {
    const filters = buildFilters(1);
    activeFiltersRef.current = filters;
    fetchExpenses(filters);
    fetchCategories('expense');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadRecurringSuggestions = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;

        const [prevRes, currRes] = await Promise.all([
          expenseService.getExpenses({ month: prevMonth, year: prevYear, limit: 50 }),
          expenseService.getExpenses({ month, year, limit: 50 }),
        ]);
        const prevExpenses = prevRes?.data || [];
        const currExpenses = currRes?.data || [];

        const dismissed = JSON.parse(sessionStorage.getItem('dismissed_recurring') || '[]');

        const currentKeys = new Set(
          currExpenses.map((e) => `${(e.concept || '').toLowerCase()}|${e.categoryId || e.category?._id || ''}`)
        );

        const suggestions = prevExpenses.filter((e) => {
          if (!e.isRecurring) return false;
          const id = e.id || e._id;
          if (dismissed.includes(id)) return false;
          const key = `${(e.concept || '').toLowerCase()}|${e.categoryId || e.category?._id || ''}`;
          return !currentKeys.has(key);
        });

        setRecurringSuggestions(suggestions);
      } catch {
        setRecurringSuggestions([]);
      }
    };
    loadRecurringSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegisterRecurring = async (expense) => {
    const { id, _id, date, createdAt, updatedAt, clientRequestId, category, ...rest } = expense;
    await addExpense({
      ...rest,
      categoryId: expense.categoryId || category?._id || category?.id || category,
      date: toLocalNoonISOString(getTodayInputValue()),
    });
    setRecurringSuggestions((prev) => prev.filter((e) => (e.id || e._id) !== (id || _id)));
    setSuccessMessage(t('expenses.recurringRegistered'));
    fetchExpenses(activeFiltersRef.current);
  };

  const handleDismissRecurring = (expense) => {
    const id = expense.id || expense._id;
    const dismissed = JSON.parse(sessionStorage.getItem('dismissed_recurring') || '[]');
    sessionStorage.setItem('dismissed_recurring', JSON.stringify([...dismissed, id]));
    setRecurringSuggestions((prev) => prev.filter((e) => (e.id || e._id) !== id));
  };

  const handleFormSubmit = async (data) => {
    if (editingPendingItem) {
      await updatePending(editingPendingItem.localId, data);
      setSuccessMessage(t('offline.successPendingEdit'));
      setEditingPendingItem(null);
    } else if (editingExpense) {
      await updateExpense(editingExpense.id || editingExpense._id, data);
      setSuccessMessage(t('expenses.successEdit'));
      setEditingExpense(null);
    } else if (!isOnline) {
      await enqueueCreate(data);
      setSuccessMessage(t('offline.savedExpense'));
    } else {
      try {
        await addExpense(data);
        setSuccessMessage(t('expenses.successCreate'));
      } catch (err) {
        if (!isNetworkError(err)) {
          throw err;
        }
        await enqueueCreate(data);
        setSuccessMessage(t('offline.savedExpense'));
      }
    }
    setShowForm(false);
    setDuplicatingExpense(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('expenses.confirmDelete'))) {
      await removeExpense(id);
      setSuccessMessage(t('expenses.successDelete'));
    }
  };

  const handleEditClick = (expense) => {
    if (successMessage) setSuccessMessage('');
    setEditingExpense(expense);
    setEditingPendingItem(null);
    setDuplicatingExpense(null);
    setShowForm(true);
  };

  const handleDuplicateClick = (expense) => {
    if (successMessage) setSuccessMessage('');
    // Copia sin id ni fecha: el formulario usará la fecha de hoy y creará un gasto nuevo
    const { id, _id, date, createdAt, updatedAt, clientRequestId, ...rest } = expense;
    setDuplicatingExpense(rest);
    setEditingExpense(null);
    setEditingPendingItem(null);
    setShowForm(true);
  };

  const handleNewExpense = () => {
    if (successMessage) setSuccessMessage('');
    setEditingExpense(null);
    setEditingPendingItem(null);
    setDuplicatingExpense(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setEditingPendingItem(null);
    setDuplicatingExpense(null);
  };

  const handleEditPending = (item) => {
    if (successMessage) setSuccessMessage('');
    setEditingExpense(null);
    setEditingPendingItem(item);
    setDuplicatingExpense(null);
    setShowForm(true);
  };

  const handleDiscardPending = async (item) => {
    if (!window.confirm(t('offline.confirmDiscard'))) return;
    await discardPending(item.localId);
    setSuccessMessage(t('offline.successDiscard'));
  };

  const handleRetryPending = async (item) => {
    await retryPending(item, addExpense);
    fetchExpenses(activeFiltersRef.current);
  };

  const handleSyncAll = async () => {
    await syncAll(addExpense);
    fetchExpenses(activeFiltersRef.current);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    const filters = buildFilters(1);
    activeFiltersRef.current = filters;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      categoryFilter, monthFilter, searchFilter, minAmountFilter, maxAmountFilter, sortOrder,
    }));
    fetchExpenses(filters);
  };

  const handleClearFilters = () => {
    setCategoryFilter('');
    setMonthFilter('');
    setSearchFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setSortOrder('date-desc');
    setCurrentPage(1);
    sessionStorage.removeItem(STORAGE_KEY);
    activeFiltersRef.current = { page: 1 };
    fetchExpenses({ page: 1 });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const filters = { ...activeFiltersRef.current, page: newPage };
    activeFiltersRef.current = filters;
    fetchExpenses(filters);
  };

  return (
    <div className="expenses-container">
      <header className="page-header flex-between">
        <div>
          <h1>{t('expenses.title')}</h1>
          <p className="subtitle">{t('expenses.subtitle')}</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleNewExpense}
          disabled={showForm}
          data-testid="new-expense-button"
        >
          {t('expenses.newButton')}
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

      {!showForm && recurringSuggestions.length > 0 && (
        <div className="alert alert-info recurring-banner" role="status" data-testid="recurring-suggestions">
          <strong>{t('expenses.recurringTitle')}</strong>
          <p className="hint">{t('expenses.recurringHint')}</p>
          <ul className="recurring-list">
            {recurringSuggestions.map((expense) => (
              <li key={expense.id || expense._id} className="recurring-item" data-testid="recurring-item">
                <span>{expense.concept} — {formatCurrency(expense.amount)}</span>
                <span className="recurring-actions">
                  <button type="button" className="btn-secondary btn-small" onClick={() => handleRegisterRecurring(expense)} data-testid="recurring-register">
                    {t('expenses.recurringRegister')}
                  </button>
                  <button type="button" className="btn-icon" onClick={() => handleDismissRecurring(expense)} aria-label={`${t('expenses.recurringDismiss')}: ${expense.concept}`} data-testid="recurring-dismiss">
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!showForm && (
        <div className="filters-panel" data-testid="expense-filters">
          <div className="filters-bar">
            <input
              type="search"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              placeholder={t('expenses.searchPlaceholder')}
              className="filter-search"
              data-testid="filter-search"
              aria-label="Buscar gastos"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              data-testid="filter-category"
              aria-label="Filtrar por categoría"
            >
              <option value="">{t('expenses.allCategories')}</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              data-testid="filter-month"
              aria-label="Filtrar por mes"
            />
            <button
              type="button"
              className="btn-secondary btn-filter"
              onClick={() => setShowAdvancedFilters((s) => !s)}
              aria-expanded={showAdvancedFilters}
              data-testid="toggle-advanced-filters"
            >
              {showAdvancedFilters ? t('expenses.filterLess') : t('expenses.filterMore')}
            </button>
            <button
              type="button"
              className="btn-secondary btn-filter"
              onClick={handleApplyFilters}
              data-testid="apply-filters"
            >
              {t('expenses.filterButton')}
            </button>
            <button
              type="button"
              className="btn-secondary btn-filter"
              onClick={handleClearFilters}
              data-testid="clear-filters"
            >
              {t('expenses.clearButton')}
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="filters-bar filters-advanced" data-testid="advanced-filters">
              <input
                type="number"
                value={minAmountFilter}
                onChange={(e) => setMinAmountFilter(e.target.value)}
                min="0"
                step="0.01"
                placeholder={t('expenses.amountMin')}
                data-testid="filter-min-amount"
                aria-label={t('expenses.amountMin')}
              />
              <input
                type="number"
                value={maxAmountFilter}
                onChange={(e) => setMaxAmountFilter(e.target.value)}
                min="0"
                step="0.01"
                placeholder={t('expenses.amountMax')}
                data-testid="filter-max-amount"
                aria-label={t('expenses.amountMax')}
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                data-testid="filter-sort"
                aria-label="Ordenar por"
              >
                <option value="date-desc">{t('expenses.sortNewest')}</option>
                <option value="date-asc">{t('expenses.sortOldest')}</option>
                <option value="amount-desc">{t('expenses.sortAmountDesc')}</option>
                <option value="amount-asc">{t('expenses.sortAmountAsc')}</option>
              </select>
            </div>
          )}
        </div>
      )}

      {showForm ? (
        <div className="card form-card">
          <h3>
            {editingExpense || editingPendingItem
              ? t('expenses.formTitleEdit')
              : duplicatingExpense
                ? t('expenses.formTitleDuplicate')
                : t('expenses.formTitleCreate')}
          </h3>
          <ExpenseForm
            initialData={editingExpense || editingPendingItem?.payload || duplicatingExpense}
            isDuplicate={!!duplicatingExpense}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
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
            <ExpenseList
              expenses={expenses}
              isLoading={isLoading}
              error={error}
              onEdit={handleEditClick}
              onDuplicate={handleDuplicateClick}
              onDelete={handleDelete}
            />
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              disabled={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Expenses;
