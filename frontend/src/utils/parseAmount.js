/**
 * Parsea un monto escrito por el usuario aceptando punto o coma
 * como separador decimal. Devuelve NaN si el formato es inválido.
 * No admite separadores de miles.
 */
export const parseAmount = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value !== 'string') {
    return NaN;
  }
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return NaN;
  }
  return Number(normalized);
};

export default parseAmount;
