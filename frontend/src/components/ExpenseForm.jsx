import { useForm } from '../hooks/useForm.js';

const ExpenseForm = ({ onSubmit, initialData = null, onCancel, isSubmitting: externalIsSubmitting }) => {
  const isEdit = !!initialData;
  
  const handleSubmitForm = async (values) => {
    if (!values.amount || !values.concept || !values.date) {
      throw { validationErrors: { general: 'Por favor, completa los campos obligatorios.' } };
    }
    if (Number(values.amount) <= 0) {
      throw { validationErrors: { amount: 'El monto debe ser mayor a 0.' } };
    }
    await onSubmit(values);
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    {
      concept: initialData?.concept || '',
      amount: initialData?.amount || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      categoryId: initialData?.categoryId || '',
      description: initialData?.description || ''
    },
    handleSubmitForm
  );

  const loading = isSubmitting || externalIsSubmitting;

  return (
    <form onSubmit={handleSubmit} className="expense-form" noValidate>
      {errors.general && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          {errors.general}
        </div>
      )}
      {errors.submit && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
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
          aria-describedby={errors.concept ? "concept-error" : undefined}
        />
        {errors.concept && <span id="concept-error" className="error-text" role="alert">{errors.concept}</span>}
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
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
          {errors.amount && <span id="amount-error" className="error-text" role="alert">{errors.amount}</span>}
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
            aria-describedby={errors.date ? "date-error" : undefined}
          />
          {errors.date && <span id="date-error" className="error-text" role="alert">{errors.date}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="categoryId">Categoría</label>
        <select
          id="categoryId"
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          disabled={loading}
          className="form-select"
        >
          <option value="">Selecciona una categoría</option>
          <option value="1">Alimentación</option>
          <option value="2">Transporte</option>
          <option value="3">Vivienda</option>
          <option value="4">Entretenimiento</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Notas Adicionales</label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Detalles del gasto (opcional)"
          disabled={loading}
          className="form-textarea"
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? 'Guardando...' : (isEdit ? 'Actualizar Gasto' : 'Crear Gasto')}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
