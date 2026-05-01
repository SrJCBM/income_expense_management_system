import { useEffect, useState } from 'react';
import { useCategories } from '../hooks/useCategories.js';
import { useForm } from '../hooks/useForm.js';
import '../styles/pages/Expenses.css';

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

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategorySubmit = async (values) => {
    if (!values.name || !values.type) {
      throw { validationErrors: { general: 'El nombre y tipo de categoría son obligatorios.' } };
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
    } else {
      await addCategory(payload);
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
      icon: '📌',
      description: '',
    },
    handleCategorySubmit
  );

  const handleCreateClick = () => {
    resetForm();
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFieldValue('name', category.name || '');
    setFieldValue('type', category.type || 'expense');
    setFieldValue('color', category.color || '#6366f1');
    setFieldValue('icon', category.icon || '📌');
    setFieldValue('description', category.description || '');
    setShowForm(true);
  };

  const handleDeleteClick = async (category) => {
    if (!window.confirm(`¿Eliminar la categoría \"${category.name}\"?`)) {
      return;
    }

    try {
      await removeCategory(category.id || category._id);
    } catch {
      // El error ya se maneja desde el hook
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
          <h1>Gestionar Categorías</h1>
          <p className="subtitle">Organiza tus transacciones</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleCreateClick}
          disabled={showForm}
        >
          + Nueva Categoría
        </button>
      </header>

      {showForm ? (
        <div className="card form-card">
          <h3>{editingCategory ? 'Editar Categoría' : 'Crear Categoría'}</h3>

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

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category-name">Nombre *</label>
                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="Ej. Alimentación"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <span id="name-error" className="error-text" role="alert">{errors.name}</span>}
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
                  aria-describedby={errors.type ? "type-error" : undefined}
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
                {errors.type && <span id="type-error" className="error-text" role="alert">{errors.type}</span>}
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
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-icon">Icono</label>
                <input
                  id="category-icon"
                  type="text"
                  name="icon"
                  value={values.icon}
                  onChange={handleChange}
                  maxLength={4}
                  placeholder="📌"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category-description">Descripción</label>
              <textarea
                id="category-description"
                name="description"
                value={values.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Describe para qué usarás esta categoría (opcional)"
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting
                  ? 'Guardando...'
                  : editingCategory
                    ? 'Actualizar Categoría'
                    : 'Crear Categoría'}
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
              <h3>No tienes categorías registradas</h3>
              <p className="hint">Crea una categoría para organizar tus movimientos.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Color</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const categoryId = category.id || category._id;

                  return (
                    <tr key={categoryId}>
                      <td>
                        <span style={{ marginRight: '0.5rem' }}>{category.icon || '📌'}</span>
                        {category.name}
                      </td>
                      <td>{category.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
                      <td>{category.description || 'Sin descripción'}</td>
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
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteClick(category)}
                          title="Eliminar"
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
