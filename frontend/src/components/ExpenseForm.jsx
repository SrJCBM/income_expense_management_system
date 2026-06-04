import { useEffect } from 'react';
import { useForm } from '../hooks/useForm.js';
import { useCategories } from '../hooks/useCategories.js';
import { getTodayInputValue, toDateInputValue, toLocalNoonISOString } from '../utils/dateUtils.js';

const ExpenseForm = ({ onSubmit, initialData = null, onCancel, isSubmitting: externalIsSubmitting }) => {
  const isEdit = !!initialData;
  const { categories, isLoading: isLoadingCategories, error: categoriesError, fetchCategories } = useCategories();

  useEffect(() => {
    fetchCategories('expense');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitForm = async (values) => {
    if (!values.amount || !values.concept || !values.date) {
      throw { validationErrors: { general: 'Por favor, completa los campos obligatorios.' } };
    }
    if (Number(values.amount) <= 0) {
      throw { validationErrors: { amount: 'El monto debe ser mayor a 0.' } };
    }
    if (!values.categoryId) {
      throw { validationErrors: { categoryId: 'Selecciona una categoría para el gasto.' } };
    }
    await onSubmit({
      ...values,
      amount: Number(values.amount),
      date: toLocalNoonISOString(values.date),
    });
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    {
      concept: initialData?.concept || '',
      amount: initialData?.amount || '',
      date: toDateInputValue(initialData?.date) || getTodayInputValue(),
      categoryId: initialData?.categoryId || initialData?.category?._id || initialData?.category?.id || initialData?.category || '',
      notes: initialData?.notes || initialData?.description || '',
    },
    handleSubmitForm
  );

  const loading = isSubmitting || externalIsSubmitting;

  return (
    <form onSubmit={handleSubmit} className="expense-form" noValidate data-testid="expense-form">
      {errors.general && (
        <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="expense-error-general">
          {errors.general}
        </div>
      )}
      {errors.submit && (
        <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="expense-error-submit">
          {errors.submit}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="concept">Concepto *</label>
        <input
          type="text"
          id="concept"
          name="concept"
          value={values.concept}
          onChange={handleChange}
          placeholder="Ej. Supermercado"
          disabled={loading}
          aria-required="true"
          aria-invalid={!!errors.concept}
          aria-describedby={errors.concept ? 'concept-error' : undefined}
          data-testid="expense-concept"
        />
        {errors.concept && (
          <span id="concept-error" className="error-text" role="alert" data-testid="expense-error-concept">
            {errors.concept}
          </span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Monto ($) *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={values.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            data-testid="expense-amount"
          />
          {errors.amount && (
            <span id="amount-error" className="error-text" role="alert" data-testid="expense-error-amount">
              {errors.amount}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={values.date}
            onChange={handleChange}
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
            data-testid="expense-date"
          />
          {errors.date && (
            <span id="date-error" className="error-text" role="alert" data-testid="expense-error-date">
              {errors.date}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="categoryId">Categoría *</label>
        <select
          id="categoryId"
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          disabled={loading || isLoadingCategories}
          className="form-select"
          data-testid="expense-category"
          aria-required="true"
          aria-invalid={!!errors.categoryId}
          aria-describedby={errors.categoryId ? 'categoryId-error' : undefined}
        >
          <option value="">{isLoadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}</option>
          {categories.map((category) => (
            <option key={category.id || category._id} value={category.id || category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span id="categoryId-error" className="error-text" role="alert" data-testid="expense-error-category">
            {errors.categoryId}
          </span>
        )}
        {categoriesError && (
          <span className="error-text" role="alert" data-testid="expense-categories-error">
            {categoriesError}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notas Adicionales</label>
        <textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Detalles del gasto (opcional)"
          disabled={loading}
          className="form-textarea"
          data-testid="expense-notes"
        ></textarea>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
          data-testid="expense-cancel"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          aria-busy={loading}
          data-testid="expense-submit"
        >
          {loading ? 'Guardando...' : isEdit ? 'Actualizar Gasto' : 'Crear Gasto'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
