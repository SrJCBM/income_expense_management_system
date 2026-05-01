/**
 * Servicio de Reportes para Frontend
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

const EMPTY_SUMMARY = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  expensesByCategory: [],
};

const formatServiceError = (error, fallbackMessage) => {
  if (!error.response) {
    return new Error('No se pudo conectar con el servidor para cargar reportes.');
  }

  return new Error(error.response?.data?.message || fallbackMessage);
};

class ReportService {
  async getFilters() {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.FILTERS);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        return {
          success: true,
          data: {
            years: [year],
            monthsByYear: {},
            suggestedMonth: month,
            suggestedYear: year,
            hasData: false,
          },
          message: 'Sin periodos disponibles para reportes',
        };
      }

      throw formatServiceError(error, 'No se pudieron obtener los filtros de reportes.');
    }
  }

  async getSummary(month, year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.SUMMARY, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: EMPTY_SUMMARY,
          message: 'No hay datos suficientes para reportes aún',
        };
      }

      throw formatServiceError(error, 'No se pudo obtener el resumen de reportes.');
    }
  }

  async getMonthlyReport(month, year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.MONTHLY, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      throw formatServiceError(error, 'No se pudo obtener el reporte mensual.');
    }
  }

  async getYearlyReport(year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.YEARLY, {
        params: { year },
      });
      return response.data;
    } catch (error) {
      throw formatServiceError(error, 'No se pudo obtener el reporte anual.');
    }
  }

  async getCategoryBreakdown(month, year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.CATEGORY_BREAKDOWN, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      throw formatServiceError(error, 'No se pudo obtener el desglose por categoría.');
    }
  }
}

export default new ReportService();
