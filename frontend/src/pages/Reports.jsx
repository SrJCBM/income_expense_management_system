import { useState, useEffect } from 'react';
import '../styles/pages/Reports.css';
import reportService from '../services/reportService.js';
import ReportCharts from '../components/ReportCharts.jsx';
import { useExport } from '../hooks/useExport.js';

const DEFAULT_SUMMARY = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  expensesByCategory: [],
};

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DEFAULT_FILTERS = {
  years: [new Date().getFullYear()],
  monthsByYear: {},
  hasData: false,
};

const Reports = () => {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersLoading, setFiltersLoading] = useState(true);
  
  // Hook para exportación con feedback
  const { isExporting, exportError, exportSuccess, handleExportPDF, handleExportExcel } = useExport();

  useEffect(() => {
    const fetchReportFilters = async () => {
      setFiltersLoading(true);
      setError(null);

      try {
        const response = await reportService.getFilters();
        const payload = response?.data || DEFAULT_FILTERS;
        const years = Array.isArray(payload.years) && payload.years.length > 0
          ? payload.years.map((item) => Number(item))
          : [new Date().getFullYear()];
        const monthsByYear = payload.monthsByYear || {};
        const suggestedYear = Number(payload.suggestedYear) || years[0];
        const monthsForYear = monthsByYear[suggestedYear] || [];
        const suggestedMonth = Number(payload.suggestedMonth);
        const resolvedMonth = monthsForYear.includes(suggestedMonth)
          ? suggestedMonth
          : (monthsForYear[monthsForYear.length - 1] || month);

        setFilters({
          years,
          monthsByYear,
          hasData: Boolean(payload.hasData),
        });

        setYear(suggestedYear);
        setMonth(resolvedMonth);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los filtros de reportes.');
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchReportFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!filters.hasData) {
      return;
    }

    const availableMonths = filters.monthsByYear?.[year] || [];

    if (availableMonths.length > 0 && !availableMonths.includes(Number(month))) {
      setMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [filters, month, year]);

  useEffect(() => {
    if (filtersLoading) {
      return;
    }

    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await reportService.getSummary(month, year);
        const payload = response?.data || DEFAULT_SUMMARY;

        setSummary({
          totalIncome: Number(payload.totalIncome || 0),
          totalExpense: Number(payload.totalExpense || 0),
          balance: Number(payload.balance || 0),
          expensesByCategory: Array.isArray(payload.expensesByCategory)
            ? payload.expensesByCategory
            : [],
        });
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los reportes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [month, year, filtersLoading]);

  const availableMonths = filters.monthsByYear?.[year] || [];

  const hasReportData =
    summary.totalIncome > 0 ||
    summary.totalExpense > 0 ||
    (summary.expensesByCategory && summary.expensesByCategory.length > 0);

  return (
    <div className="reports-container">
      <header className="page-header flex-between">
        <div>
          <h1>Reportes y Análisis</h1>
          <p className="subtitle">Visualiza el estado de tus finanzas</p>
        </div>
        <div className="header-controls">
          {filters.hasData && (
            <div className="filters">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="form-select filter-select"
                aria-label="Filtrar por mes"
              >
                {availableMonths.map((monthOption) => (
                  <option key={monthOption} value={monthOption}>
                    {MONTH_LABELS[monthOption - 1]}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="form-select filter-select"
                aria-label="Filtrar por año"
              >
                {filters.years.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasReportData && (
            <div className="export-buttons">
              <button
                onClick={() => handleExportPDF(summary, month, year)}
                className="btn-secondary"
                disabled={isExporting}
                aria-label="Descargar reporte financiero en formato PDF"
                title="Descargar reporte financiero en PDF"
                aria-busy={isExporting}
              >
                {isExporting ? '⏳ Descargando...' : '📄 PDF'}
              </button>
              <button
                onClick={() => handleExportExcel(summary, month, year)}
                className="btn-secondary"
                disabled={isExporting}
                aria-label="Descargar reporte financiero en formato Excel"
                title="Descargar reporte financiero en Excel"
                aria-busy={isExporting}
              >
                {isExporting ? '⏳ Descargando...' : '📊 Excel'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Feedback de Exportación */}
      {exportError && (
        <div className="alert alert-error" role="alert" aria-live="polite">
          ⚠️ Error: {exportError}. Por favor intenta de nuevo.
        </div>
      )}
      
      {exportSuccess && (
        <div className="alert alert-success" role="alert" aria-live="polite">
          ✅ Reporte descargado exitosamente
        </div>
      )}

      {isLoading || filtersLoading ? (
        <div className="skeleton-item" style={{ height: '300px' }}></div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : !hasReportData ? (
        <div className="card list-card">
          <h3>Aún no hay datos para reportes</h3>
          <p className="hint">Cuando registres ingresos y gastos, verás aquí tu análisis financiero.</p>
        </div>
      ) : summary && (
        <div className="reports-content">
          <ReportCharts data={summary} />
          
          <div className="dashboard-grid">
            <div className="dashboard-card incomes-card">
              <h3>Ingresos</h3>
              <p className="amount positive">+${summary.totalIncome.toFixed(2)}</p>
            </div>
            <div className="dashboard-card expenses-card">
              <h3>Gastos</h3>
              <p className="amount negative">-${summary.totalExpense.toFixed(2)}</p>
            </div>
            <div className="dashboard-card summary-card">
              <h3>Balance Neto</h3>
              <p className="amount">${summary.balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="card list-card">
            <h3>Gastos por Categoría</h3>
            <div className="category-bars">
              {summary.expensesByCategory.map((cat, idx) => (
                <div key={idx} className="category-bar-item">
                  <div className="bar-info flex-between">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-amount">${cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${cat.percentage}%`, 
                        backgroundColor: cat.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
