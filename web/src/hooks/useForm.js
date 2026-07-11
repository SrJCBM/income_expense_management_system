/**
 * Custom Hook para Formularios
 * Gestión de estado y validación de formularios
 */

import { useState } from 'react';

export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setErrors({ submit: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const setFieldValue = (name, value) => {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const setFieldError = (name, error) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: error,
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
  };
};
