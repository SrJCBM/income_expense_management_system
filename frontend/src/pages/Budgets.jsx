import { useEffect, useState } from 'react';
import { useBudgets } from '../hooks/useBudgets.js';
import { useCategories } from '../hooks/useCategories.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { getMonthName } from '../utils/formatters.js';
import '../styles/pages/Expenses.css';
import '../styles/pages/Budgets.css';

const getCurrentPeriod = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

const emptyForm = { categoryId: '', limitAmount: '', alertThreshold: '80' };

const Budgets = () => {
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
      setFormError('Selecciona una categoría.');
      return;
    }

    if (!formValues.limitAmount || Number(formValues.limitAmount) <= 0) {
      setFormError('El monto límite debe ser mayor a 0.');
      return;
    }

    const payload = {
      categoryId: formValues.categoryId,
      limitAmount: Number(formValues.limitAmount),
      alertThreshold: Number(formValues.alertThreshold) || 80,
      month: period.month,
      year: period.year,
    };

    setIsSubmitting(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, payload);
        setSuccessMessage('Presupuesto actualizado exitosamente.');
      } else {
        await addBudget(payload);
        setSuccessMessage('Presupuesto creado exitosamente.');
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
    if (!window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      return;
    }

    try {
      await removeBudget(budget.id);
      setSuccessMessage('Presupuesto eliminado exitosamente.');
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
          <h1>Presupuestos</h1>
          <p className="subtitle">
            Define límites de gasto por categoría para {getMonthName(period.month)} {period.year}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={openCreateForm}
          disabled={showForm}
          data-testid="new-budget-button"
        >
          + Nuevo Presupuesto
        </button>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {!showForm && (
        <div className="filters-bar" data-testid="budget-filters">
          <label htmlFor="budget-period" className="filter-label">Período</label>
          <input
            id="budget-period"
            type="month"
            value={periodInputValue}
            onChange={handlePeriodChange}
            data-testid="budget-period"
            aria-label="Seleccionar período"
          />
        </div>
      )}

      {showForm ? (
        <div className="card form-card">
          <h3>{editingBudget ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}</h3>

          {formError && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="budget-error">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate data-testid="budget-form">
            <div className="form-group">
              <label htmlFor="budget-category">Categoría de gasto *</label>
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
                <option value="">Selecciona una categoría</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id || category._id} value={category.id || category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget-limit">Monto límite *</label>
                <input
                  id="budget-limit"
                  type="number"
                  name="limitAmount"
                  value={formValues.limitAmount}
                  onChange={handleFormChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-required="true"
                  data-testid="budget-limit"
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget-threshold">Umbral de alerta (%)</label>
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
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                data-testid="budget-submit"
              >
                {isSubmitting
                  ? 'Guardando...'
                  : editingBudget
                    ? 'Actualizar Presupuesto'
                    : 'Crear Presupuesto'}
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
          Error al cargar los presupuestos: {error}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card list-card">
          <div className="empty-state" data-testid="budget-empty">
            <div className="empty-icon">🎯</div>
            <h3>No tienes presupuestos para este período</h3>
            <p className="hint">Crea un presupuesto para controlar tus gastos por categoría.</p>
          </div>
        </div>
      ) : (
        <div className="budget-grid" data-testid="budget-list">
          {budgets.map((budget) => {
            const state = getProgressState(budget);
            const percentage = Math.min(budget.percentageUsed ?? 0, 100);

            return (
              <article key={budget.id} className={`budget-card budget-${state}`} data-testid="budget-item">
                <header className="budget-card-header">
                  <span
                    className="budget-category-dot"
                    style={{ backgroundColor: budget.category?.color || 'var(--primary-color)' }}
                    aria-hidden="true"
                  ></span>
                  <h3 className="budget-category-name">{budget.category?.name || 'Sin categoría'}</h3>
                  <div className="actions-cell">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEditForm(budget)}
                      title="Editar presupuesto"
                      aria-label={`Editar presupuesto de ${budget.category?.name || 'categoría'}`}
                      data-testid="edit-budget"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(budget)}
                      title="Eliminar presupuesto"
                      aria-label={`Eliminar presupuesto de ${budget.category?.name || 'categoría'}`}
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
                  aria-label={`Progreso del presupuesto de ${budget.category?.name || 'categoría'}`}
                >
                  <div className="budget-progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>

                <div className="budget-amounts">
                  <span data-testid="budget-spent">
                    Gastado: <strong>{formatCurrency(budget.spentAmount)}</strong>
                  </span>
                  <span data-testid="budget-limit-amount">
                    Límite: <strong>{formatCurrency(budget.limitAmount)}</strong>
                  </span>
                </div>

                <p className="budget-status" data-testid="budget-status">
                  {budget.isOverBudget
                    ? `Excedido por ${formatCurrency(budget.spentAmount - budget.limitAmount)}`
                    : budget.isNearLimit
                      ? `Cerca del límite (${budget.percentageUsed}%)`
                      : `Disponible: ${formatCurrency(budget.remainingAmount)} (${budget.percentageUsed}% usado)`}
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
