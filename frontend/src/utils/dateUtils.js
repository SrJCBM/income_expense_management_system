const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const toDateInputValue = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    const datePart = value.slice(0, 10);
    if (DATE_ONLY_PATTERN.test(datePart)) {
      return datePart;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const toLocalNoonISOString = (dateInputValue) => {
  if (!DATE_ONLY_PATTERN.test(String(dateInputValue || ''))) {
    return dateInputValue;
  }

  return `${dateInputValue}T12:00:00`;
};
