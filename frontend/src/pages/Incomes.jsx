import { useEffect, useState, useRef } from 'react';
import { useIncomes } from '../hooks/useIncomes.js';
import { useForm } from '../hooks/useForm.js';
import Pagination from '../components/Pagination.jsx';
import categoryService from '../services/categoryService.js';
import { getTodayInputValue, toDateInputValue, toLocalNoonISOString } from '../utils/dateUtils.js';
import { useSettings } from '../context/SettingsContext.jsx';
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
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    try {
      const response = await categoryService.getCategories('income');
      setCategories(response?.data || []);
    } catch (err) {
      setCategoriesError(err.message);
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
      throw { validationErrors: { general: 'Completa concepto, monto, fecha y categoría.' } };
    }

    if (Number(values.amount) <= 0) {
      throw { validationErrors: { amount: 'El monto debe ser mayor a 0.' } };
    }

    const payload = {
      concept: values.concept,
      amount: Number(values.amount),
      date: toLocalNoonISOString(values.date),
      categoryId: values.categoryId,
      notes: values.notes,
    };

    if (editingIncome) {
      await updateIncome(editingIncome.id || editingIncome._id, payload);
      setSuccessMessage('Ingreso actualizado exitosamente.');
    } else {
      await addIncome(payload);
      setSuccessMessage('Ingreso creado exitosamente.');
    }

    setShowForm(false);
    resetForm();
    setEditingIncome(null);
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setFieldValue } = useForm(
    { concept: '', amount: '', date: getTodayInputValue(), categoryId: '', notes: '' },
    handleIncomeSubmit
  );

  const handleShowCreateForm = () => {
    if (successMessage) setSuccessMessage('');
    resetForm();
    setEditingIncome(null);
    setShowForm(true);
  };

  const handleEdit = (income) => {
    if (successMessage) setSuccessMessage('');
    setEditingIncome(income);
    setFieldValue('concept', income.concept || income.description || '');
    setFieldValue('amount', income.amount || '');
    setFieldValue('date', toDateInputValue(income.date));
    setFieldValue('categoryId', income.categoryId || income.category?._id || income.category?.id || income.category || '');
    setFieldValue('notes', income.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (incomeId) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingreso?')) return;
    try {
      await removeIncome(incomeId);
      setSuccessMessage('Ingreso eliminado exitosamente.');
    } catch {
      // El error ya se expone por el hook en la UI
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setEditingIncome(null);
  };

  return (
    <div className="expenses-container">
      <header className="page-header flex-between">
        <div>
          <h1>Gestionar Ingresos</h1>
          <p className="subtitle">Lleva el control de todas tus entradas de dinero</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleShowCreateForm}
          disabled={showForm}
          data-testid="new-income-button"
        >
          + Nuevo Ingreso
        </button>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {!showForm && (
        <div className="filters-bar" data-testid="income-filters">
          <input
            type="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="Buscar por concepto o notas..."
            className="filter-search"
            data-testid="income-filter-search"
            aria-label="Buscar ingresos"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            data-testid="income-filter-category"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            data-testid="income-filter-month"
            aria-label="Filtrar por mes"
          />
          <button
            type="button"
            className="btn-secondary btn-filter"
            onClick={handleApplyFilters}
            data-testid="income-apply-filters"
          >
            Filtrar
          </button>
          <button
            type="button"
            className="btn-secondary btn-filter"
            onClick={handleClearFilters}
            data-testid="income-clear-filters"
          >
            Limpiar
          </button>
        </div>
      )}

      {showForm ? (
        <div className="card form-card">
          <h3>{editingIncome ? 'Editar Ingreso' : 'Registrar Nuevo Ingreso'}</h3>

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
              <label htmlFor="income-concept">Concepto *</label>
              <input
                id="income-concept"
                type="text"
                name="concept"
                value={values.concept}
                onChange={handleChange}
                placeholder="Ej. Pago de salario"
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
                <label htmlFor="income-amount">Monto *</label>
                <input
                  id="income-amount"
                  type="number"
                  name="amount"
                  value={values.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
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
                <label htmlFor="income-date">Fecha *</label>
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
              <label htmlFor="income-category">Categoría *</label>
              <select
                id="income-category"
                name="categoryId"
                value={values.categoryId}
                onChange={handleChange}
                className="form-select"
                disabled={isSubmitting || categories.length === 0}
                aria-required="true"
                aria-invalid={!!errors.categoryId}
                aria-describedby={errors.categoryId ? 'category-error' : undefined}
                data-testid="income-category"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id || category._id} value={category.id || category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span id="category-error" className="error-text" role="alert" data-testid="income-error-category">{errors.categoryId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="income-notes">Notas</label>
              <textarea
                id="income-notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                placeholder="Información adicional (opcional)"
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
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                data-testid="income-submit"
              >
                {isSubmitting ? 'Guardando...' : editingIncome ? 'Actualizar Ingreso' : 'Crear Ingreso'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card list-card">
          {isLoading ? (
            <div className="skeleton-item"></div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : incomes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>No tienes ingresos registrados</h3>
              <p className="hint">Agrega un nuevo ingreso para comenzar.</p>
            </div>
          ) : (
            <table className="data-table" data-testid="income-list">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => {
                  const incomeId = income.id || income._id;
                  return (
                    <tr key={incomeId} data-testid="income-item">
                      <td>{toDateInputValue(income.date)}</td>
                      <td>{income.concept}</td>
                      <td>{income.category?.name || 'Sin categoría'}</td>
                      <td className="amount positive">+{formatCurrency(income.amount)}</td>
                      <td className="actions-cell">
                        <button className="btn-icon" onClick={() => handleEdit(income)} title="Editar" data-testid="edit-income">✏️</button>
                        <button className="btn-icon" onClick={() => handleDelete(incomeId)} title="Eliminar" data-testid="delete-income">🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        </div>
      )}

      {!showForm && categoriesError && (
        <div className="alert alert-error">{categoriesError}</div>
      )}

      {!showForm && !categoriesError && categories.length === 0 && (
        <div className="card list-card">
          <p className="hint">No hay categorías de ingresos disponibles. Crea una en la sección de categorías.</p>
        </div>
      )}
    </div>
  );
};

export default Incomes;
