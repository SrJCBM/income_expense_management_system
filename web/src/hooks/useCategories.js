import { useState } from 'react';
import categoryService from '../services/categoryService.js';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async (type = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories(type);
      setCategories(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (categoryData) => {
    try {
      setError(null);
      const response = await categoryService.createCategory(categoryData);
      setCategories((currentCategories) => [...currentCategories, response.data]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      setError(null);
      const response = await categoryService.updateCategory(id, categoryData);
      setCategories((currentCategories) =>
        currentCategories.map((category) => {
          const categoryId = category.id || category._id;
          return categoryId === id ? response.data : category;
        })
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeCategory = async (id) => {
    try {
      setError(null);
      await categoryService.deleteCategory(id);
      setCategories((currentCategories) =>
        currentCategories.filter((category) => (category.id || category._id) !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    removeCategory,
  };
};
