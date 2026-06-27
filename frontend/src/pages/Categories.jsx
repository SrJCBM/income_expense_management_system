import { useEffect, useState } from 'react';
import { useCategories } from '../hooks/useCategories.js';
import { useForm } from '../hooks/useForm.js';
import '../styles/pages/Expenses.css';
import '../styles/pages/Categories.css';

const ALL_ICONS = [
  '💰','💳','🏦','📈','📉','💎','🪙','💵','🤑','💸',
  '🍔','🍕','🍣','🥗','🍺','🍷','☕','🍰','🥤','🍎',
  '🚗','🚌','✈️','🚂','🚕','🛵','🚲','⛽','🛞','🗺️',
  '🏠','🏡','💡','🔧','🪴','🧹','📦','🔑','🛒','🧰',
  '💊','🏥','💪','🧘','🩺','🦷','👓','🩹','🏃','🧬',
  '📚','🎓','📝','🔬','🎨','✏️','📐','🏫','📖','🧪',
  '💼','💻','📊','📱','📞','🖥️','⌨️','📋','📁','🗂️',
  '🎮','🎬','🎵','🎭','📺','🎲','⚽','🎸','🎯','🎪',
  '🐕','🐈','🌿','🌺','🌳','💇','💆','👶','🧴','🪞',
  '📌','⭐','🏆','❤️','✨','🔴','🟡','🟢','🟣','🔵',
  '🚬','🍸','🥃','🎰','🃏','🎳','🏋️','🧗','🤿','🎻',
];

const IconPicker = ({ value, onChange, disabled }) => (
  <div className="icon-picker" role="radiogroup" aria-label="Seleccionar ícono">
    {ALL_ICONS.map((icon) => (
      <button
        key={icon}
        type="button"
        role="radio"
        aria-checked={value === icon}
        className={`icon-btn${value === icon ? ' icon-btn-selected' : ''}`}
        onClick={() => !disabled && onChange(icon)}
        disabled={disabled}
        title={icon}
      >
        {icon}
      </button>
    ))}
  </div>
);

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
      throw { validationErrors: { general: 'El nombre y tipo de categoría son obligatorios.' } };
    }

    if (!/[A-Za-z]/.test(values.name)) {
      throw { validationErrors: { name: 'El nombre debe incluir al menos una letra' } };
    }

    if (!values.icon || !ALL_ICONS.includes(values.icon)) {
      throw { validationErrors: { icon: 'Selecciona un ícono.' } };
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
      setSuccessMessage('Categoría actualizada exitosamente.');
    } else {
      await addCategory(payload);
      setSuccessMessage('Categoría creada exitosamente.');
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
      icon: ALL_ICONS[0],
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
    setFieldValue('icon', ALL_ICONS.includes(category.icon) ? category.icon : ALL_ICONS[0]);
    setFieldValue('description', category.description || '');
    setShowForm(true);
  };

  const handleDeleteClick = async (category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;

    try {
      await removeCategory(category.id || category._id);
      setSuccessMessage('Categoría eliminada exitosamente.');
    } catch {
      // El error ya se maneja desde el hook.
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setEditingCategory(null);
  };

  const displayIcon = (icon) => (ALL_ICONS.includes(icon) ? icon : ALL_ICONS[0]);

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
          data-testid="new-category-button"
        >
          + Nueva Categoría
        </button>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {showForm ? (
        <div className="card form-card">
          <h3>{editingCategory ? 'Editar Categoría' : 'Crear Categoría'}</h3>

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
                  placeholder="Ej. Alimentación"
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
                  data-testid="category-type"
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category-color">Color</label>
              <input
                id="category-color"
                type="color"
                name="color"
                value={values.color}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ maxWidth: 120 }}
                data-testid="category-color"
              />
            </div>

            <div className="form-group">
              <label>Ícono</label>
              <input
                type="hidden"
                name="icon"
                value={values.icon}
                data-testid="category-icon"
              />
              <IconPicker
                value={values.icon}
                onChange={(icon) => setFieldValue('icon', icon)}
                disabled={isSubmitting}
              />
              {errors.icon && <span className="error-text" role="alert" data-testid="category-error-icon">{errors.icon}</span>}
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
                data-testid="category-description"
              />
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
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                data-testid="category-submit"
              >
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
            <div className="skeleton-item" />
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏷️</div>
              <h3>No tienes categorías registradas</h3>
              <p className="hint">Crea una categoría para organizar tus movimientos.</p>
            </div>
          ) : (
            <table className="data-table" data-testid="category-list">
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
                    <tr key={categoryId} data-testid="category-item">
                      <td>
                        <span style={{ marginRight: '0.5rem' }}>{displayIcon(category.icon)}</span>
                        {category.name}
                      </td>
                      <td>{category.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
                      <td>{category.description || 'Sin descripción'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          width: 16,
                          height: 16,
                          backgroundColor: category.color || '#94a3b8',
                          borderRadius: '50%',
                        }} />
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditClick(category)}
                          title="Editar"
                          data-testid="edit-category"
                        >✏️</button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteClick(category)}
                          title="Eliminar"
                          data-testid="delete-category"
                        >🗑️</button>
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
