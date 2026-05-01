import { useState } from 'react';
import { exportToPDF, exportToExcel } from '../services/exportService.js';

/**
 * Hook para manejar exportaciones con feedback
 * Gestiona loading, errors, y notificaciones al usuario
 */
export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportPDF = async (data, month, year) => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      if (!data || !data.expensesByCategory) {
        throw new Error('No hay datos para exportar');
      }

      await exportToPDF(data, month, year);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      setExportError(error.message || 'Error al exportar PDF');
      console.error('Export PDF error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async (data, month, year) => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      if (!data || !data.expensesByCategory) {
        throw new Error('No hay datos para exportar');
      }

      await exportToExcel(data, month, year);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      setExportError(error.message || 'Error al exportar Excel');
      console.error('Export Excel error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportError,
    exportSuccess,
    handleExportPDF,
    handleExportExcel,
  };
};
