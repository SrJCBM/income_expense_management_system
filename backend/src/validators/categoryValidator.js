/**
 * Validadores de Categorías
 */

/**
 * Validar nombre de categoría
 */
export const validateCategoryName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  const trimmed = name.trim();
  // Nombre debe tener entre 1 y 50 caracteres
  return trimmed.length > 0 && trimmed.length <= 50;
};
