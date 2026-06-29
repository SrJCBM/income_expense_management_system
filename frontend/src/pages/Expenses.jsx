import { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../hooks/useExpenses.js';
import ExpenseList from '../components/ExpenseList.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import Pagination from '../components/Pagination.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { useLanguage } from '../context/LanguageContext.jsx';
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
  const { expenses, pagination, isLoading, error, fetchExpenses, addExpense, updateExpense, removeExpense } = useExpenses();
  const [showForm, setShowForm]             = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage]       = useState(1);

  const saved = loadSavedFilters();
  const [categoryFilter, setCategoryFilter]     = useState(saved?.categoryFilter || '');
  const [monthFilter, setMonthFilter]           = useState(saved?.monthFilter || '');
  const [searchFilter, setSearchFilter]         = useState(saved?.searchFilter || '');
  const [minAmountFilter, setMinAmountFilter]   = useState(saved?.minAmountFilter || '');
  const [maxAmountFilter, setMaxAmountFilter]   = useState(saved?.maxAmountFilter || '');
  const [sortOrder, setSortOrder]               = useState(saved?.sortOrder || 'date-desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { categories, fetchCategories } = useCategories();

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

  const handleFormSubmit = async (data) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id || editingExpense._id, data);
      setSuccessMessage(t('expenses.successEdit'));
      setEditingExpense(null);
    } else {
      await addExpense(data);
      setSuccessMessage(t('expenses.successCreate'));
    }
    setShowForm(false);
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
    setShowForm(true);
  };

  const handleNewExpense = () => {
    if (successMessage) setSuccessMessage('');
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
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
          <h3>{editingExpense ? t('expenses.formTitleEdit') : t('expenses.formTitleCreate')}</h3>
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      ) : (
        <div className="card list-card">
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            error={error}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default Expenses;
