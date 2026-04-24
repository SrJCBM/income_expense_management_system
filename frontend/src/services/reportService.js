/**
 * Servicio de Reportes para Frontend
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

class ReportService {
  async getSummary(month, year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.SUMMARY, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }

  async getMonthlyReport(month, year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.MONTHLY, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte mensual: ${error.message}`);
    }
  }

  async getYearlyReport(year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.YEARLY, {
        params: { year },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte anual: ${error.message}`);
    }
  }

  async getCategoryBreakdown(month, year) {
    try {
      const response = await api.get(API_ENDPOINTS.REPORTS.CATEGORY_BREAKDOWN, {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener desglose: ${error.message}`);
    }
  }
}

export default new ReportService();
