import { useEffect, useState } from 'react';
import { useCategories } from '../hooks/useCategories.js';
import { useForm } from '../hooks/useForm.js';
import '../styles/pages/Expenses.css';

const ICON_OPTIONS = [
  { value: '📌', label: 'Pin' },
  { value: '🍽️', label: 'Alimentacion' },
  { value: '🚌', label: 'Transporte' },
  { value: '🏠', label: 'Vivienda' },
  { value: '💊', label: 'Salud' },
  { value: '📚', label: 'Educacion' },
  { value: '💼', label: 'Trabajo' },
  { value: '💰', label: 'Dinero' },
  { value: '📈', label: 'Inversiones' },
  { value: '🧾', label: 'Servicios' },
];

const isAllowedIcon = (icon) => ICON_OPTIONS.some((option) => option.value === icon);

const Categories = () => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    removeCategory,
  } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategorySubmit = async (values) => {
    if (!values.name || !values.type) {
      throw { validationErrors: { general: 'El nombre y tipo de categoria son obligatorios.' } };
    }

    if (!isAllowedIcon(values.icon)) {
      throw { validationErrors: { icon: 'Selecciona un icono de la lista.' } };
    }

    const payload = {
      name: values.name,
      type: values.type,
      color: values.color,
      icon: values.icon,
      description: values.description,
    };

    if (editingCategory) {
      await updateCategory(editingCategory.id || editingCategory._id, payload);
      setSuccessMessage('Categoria actualizada exitosamente.');
    } else {
      await addCategory(payload);
      setSuccessMessage('Categoria creada exitosamente.');
    }

    setShowForm(false);
    resetForm();
    setEditingCategory(null);
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setFieldValue } = useForm(
    {
      name: '',
      type: 'expense',
      color: '#6366f1',
      icon: ICON_OPTIONS[0].value,
      description: '',
    },
    handleCategorySubmit
  );

  const handleCreateClick = () => {
    if (successMessage) setSuccessMessage('');
    resetForm();
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditClick = (category) => {
    if (successMessage) setSuccessMessage('');
    setEditingCategory(category);
    setFieldValue('name', category.name || '');
    setFieldValue('type', category.type || 'expense');
    setFieldValue('color', category.color || '#6366f1');
    setFieldValue('icon', isAllowedIcon(category.icon) ? category.icon : ICON_OPTIONS[0].value);
    setFieldValue('description', category.description || '');
    setShowForm(true);
  };

  const handleDeleteClick = async (category) => {
    if (!window.confirm(`Eliminar la categoria "${category.name}"?`)) {
      return;
    }

    try {
      await removeCategory(category.id || category._id);
      setSuccessMessage('Categoria eliminada exitosamente.');
    } catch {
      // El error ya se maneja desde el hook.
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setEditingCategory(null);
  };

  return (
    <div className="expenses-container">
      <header className="page-header flex-between">
        <div>
          <h1>Gestionar Categorias</h1>
          <p className="subtitle">Organiza tus transacciones</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleCreateClick}
          disabled={showForm}
          data-testid="new-category-button"
        >
          + Nueva Categoria
        </button>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {showForm ? (
        <div className="card form-card">
          <h3>{editingCategory ? 'Editar Categoria' : 'Crear Categoria'}</h3>

          {errors.general && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="category-error-general">
              {errors.general}
            </div>
          )}
          {errors.submit && (
            <div className="alert alert-error" role="alert" aria-live="assertive" data-testid="category-error-general">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate data-testid="category-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category-name">Nombre *</label>
                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="Ej. Alimentacion"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  data-testid="category-name"
                />
                {errors.name && <span id="name-error" className="error-text" role="alert" data-testid="category-error-name">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category-type">Tipo *</label>
                <select
                  id="category-type"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  className="form-select"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!errors.type}
                  aria-describedby={errors.type ? 'type-error' : undefined}
                  data-testid="category-type"
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
                {errors.type && <span id="type-error" className="error-text" role="alert" data-testid="category-error-type">{errors.type}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category-color">Color</label>
                <input
                  id="category-color"
                  type="color"
                  name="color"
                  value={values.color}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  data-testid="category-color"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-icon">Icono</label>
                <select
                  id="category-icon"
                  name="icon"
                  value={values.icon}
                  onChange={handleChange}
                  className="form-select"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.icon}
                  aria-describedby={errors.icon ? 'icon-error' : undefined}
                  data-testid="category-icon"
                >
                  {ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value} {option.label}
                    </option>
                  ))}
                </select>
                {errors.icon && <span id="icon-error" className="error-text" role="alert" data-testid="category-error-icon">{errors.icon}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category-description">Descripcion</label>
              <textarea
                id="category-description"
                name="description"
                value={values.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Describe para que usaras esta categoria (opcional)"
                disabled={isSubmitting}
                data-testid="category-description"
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                data-testid="category-cancel"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting} aria-busy={isSubmitting} data-testid="category-submit">
                {isSubmitting
                  ? 'Guardando...'
                  : editingCategory
                    ? 'Actualizar Categoria'
                    : 'Crear Categoria'}
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
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏷️</div>
              <h3>No tienes categorias registradas</h3>
              <p className="hint">Crea una categoria para organizar tus movimientos.</p>
            </div>
          ) : (
            <table className="data-table" data-testid="category-list">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Descripcion</th>
                  <th>Color</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const categoryId = category.id || category._id;

                  return (
                    <tr key={categoryId} data-testid="category-item">
                      <td>
                        <span style={{ marginRight: '0.5rem' }}>
                          {isAllowedIcon(category.icon) ? category.icon : ICON_OPTIONS[0].value}
                        </span>
                        {category.name}
                      </td>
                      <td>{category.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
                      <td>{category.description || 'Sin descripcion'}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            backgroundColor: category.color || '#94a3b8',
                            borderRadius: '50%',
                          }}
                        ></span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditClick(category)}
                          title="Editar"
                          data-testid="edit-category"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteClick(category)}
                          title="Eliminar"
                          data-testid="delete-category"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
