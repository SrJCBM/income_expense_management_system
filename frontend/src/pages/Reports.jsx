import { useState, useEffect } from 'react';
import '../styles/pages/Reports.css';
import reportService from '../services/reportService.js';
import ReportCharts from '../components/ReportCharts.jsx';
import { useExport } from '../hooks/useExport.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const DEFAULT_SUMMARY = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  expensesByCategory: [],
};

const DEFAULT_FILTERS = {
  years: [new Date().getFullYear()],
  monthsByYear: {},
  hasData: false,
};

const formatDMY = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const Reports = () => {
  const { t } = useLanguage();
  const monthLabels = t('months.long');

  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState('month'); // 'month' | 'range'
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [yearlyData, setYearlyData] = useState(null);

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
    if (mode === 'range' && (!rangeStart || !rangeEnd || rangeStart > rangeEnd)) {
      return;
    }

    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = mode === 'range'
          ? await reportService.getSummary(null, null, { startDate: rangeStart, endDate: rangeEnd })
          : await reportService.getSummary(month, year);
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
  }, [month, year, mode, rangeStart, rangeEnd, filtersLoading]);

  const yearlyYear = mode === 'range' && rangeStart ? Number(rangeStart.slice(0, 4)) : year;

  useEffect(() => {
    if (!yearlyYear) return;
    reportService.getYearlyReport(yearlyYear)
      .then((res) => setYearlyData(res?.data || null))
      .catch(() => setYearlyData(null));
  }, [yearlyYear]);

  const availableMonths = filters.monthsByYear?.[year] || [];

  const rangeInvalid = mode === 'range' && rangeStart && rangeEnd && rangeStart > rangeEnd;
  const waitingForRange = mode === 'range' && (!rangeStart || !rangeEnd);

  const buildPeriod = () => {
    if (mode === 'range') {
      return {
        label: `${formatDMY(rangeStart)} – ${formatDMY(rangeEnd)}`,
        fileSlug: `${rangeStart}_${rangeEnd}`,
      };
    }
    return {
      label: `${monthLabels[month - 1]} ${year}`,
      fileSlug: `${monthLabels[month - 1]}-${year}`,
    };
  };

  const hasReportData =
    summary.totalIncome > 0 ||
    summary.totalExpense > 0 ||
    (summary.expensesByCategory && summary.expensesByCategory.length > 0);

  return (
    <div className="reports-container">
      <header className="page-header flex-between">
        <div>
          <h1>{t('reports.title')}</h1>
          <p className="subtitle">{t('reports.subtitle')}</p>
        </div>
        <div className="header-controls">
          <div className="mode-toggle" role="group" aria-label={t('reports.modeToggleLabel')} data-testid="report-mode-toggle">
            <button
              type="button"
              className={`btn-secondary btn-mode${mode === 'month' ? ' active' : ''}`}
              aria-pressed={mode === 'month'}
              onClick={() => setMode('month')}
              data-testid="report-mode-month"
            >
              {t('reports.modeMonth')}
            </button>
            <button
              type="button"
              className={`btn-secondary btn-mode${mode === 'range' ? ' active' : ''}`}
              aria-pressed={mode === 'range'}
              onClick={() => setMode('range')}
              data-testid="report-mode-range"
            >
              {t('reports.modeRange')}
            </button>
          </div>
          {mode === 'month' && filters.hasData && (
            <div className="filters">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="form-select filter-select"
                aria-label={t('reports.filterByMonth')}
                data-testid="report-month-select"
              >
                {availableMonths.map((monthOption) => (
                  <option key={monthOption} value={monthOption}>
                    {monthLabels[monthOption - 1]}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="form-select filter-select"
                aria-label={t('reports.filterByYear')}
                data-testid="report-year-select"
              >
                {filters.years.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </div>
          )}
          {mode === 'range' && (
            <div className="filters range-filters">
              <label htmlFor="report-start-date">{t('reports.fromLabel')}</label>
              <input
                type="date"
                id="report-start-date"
                value={rangeStart}
                max={rangeEnd || undefined}
                onChange={(e) => setRangeStart(e.target.value)}
                data-testid="report-start-date"
              />
              <label htmlFor="report-end-date">{t('reports.toLabel')}</label>
              <input
                type="date"
                id="report-end-date"
                value={rangeEnd}
                min={rangeStart || undefined}
                onChange={(e) => setRangeEnd(e.target.value)}
                data-testid="report-end-date"
              />
            </div>
          )}
          {hasReportData && !waitingForRange && !rangeInvalid && (
            <div className="export-buttons">
              <button
                onClick={() => handleExportPDF(summary, buildPeriod())}
                className="btn-secondary"
                disabled={isExporting}
                aria-label={t('reports.exportPDFLabel')}
                title={t('reports.exportPDFTitle')}
                aria-busy={isExporting}
                data-testid="export-pdf-button"
              >
                {isExporting ? t('reports.exporting') : t('reports.exportPDF')}
              </button>
              <button
                onClick={() => handleExportExcel(summary, buildPeriod())}
                className="btn-secondary"
                disabled={isExporting}
                aria-label={t('reports.exportExcelLabel')}
                title={t('reports.exportExcelTitle')}
                aria-busy={isExporting}
                data-testid="export-excel-button"
              >
                {isExporting ? t('reports.exporting') : t('reports.exportExcel')}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Feedback de Exportación */}
      {exportError && (
        <div className="alert alert-error" role="alert" aria-live="polite">
          {t('reports.exportError')}{exportError}{t('reports.exportRetry')}
        </div>
      )}

      {exportSuccess && (
        <div className="alert alert-success" role="alert" aria-live="polite">
          {t('reports.exportSuccess')}
        </div>
      )}

      {rangeInvalid ? (
        <div className="alert alert-error" role="alert" data-testid="range-error">{t('reports.rangeError')}</div>
      ) : waitingForRange ? (
        <div className="card list-card">
          <p className="hint">{t('reports.rangePrompt')}</p>
        </div>
      ) : isLoading || filtersLoading ? (
        <div className="skeleton-item" style={{ height: '300px' }}></div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : !hasReportData ? (
        <div className="card list-card">
          <h3>{t('reports.noData')}</h3>
          <p className="hint">{t('reports.noDataHint')}</p>
        </div>
      ) : summary && (
        <div className="reports-content">
          <ReportCharts data={summary} yearlyData={yearlyData} />

          <div className="dashboard-grid">
            <div className="dashboard-card incomes-card" data-testid="summary-income">
              <h3>{t('reports.income')}</h3>
              <p className="amount positive">+${summary.totalIncome.toFixed(2)}</p>
            </div>
            <div className="dashboard-card expenses-card" data-testid="summary-expense">
              <h3>{t('reports.expense')}</h3>
              <p className="amount negative">-${summary.totalExpense.toFixed(2)}</p>
            </div>
            <div className="dashboard-card summary-card" data-testid="summary-balance">
              <h3>{t('reports.balance')}</h3>
              <p className="amount">${summary.balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="card list-card">
            <h3>{t('reports.expensesByCategory')}</h3>
            <div className="category-bars">
              {summary.expensesByCategory.map((cat, idx) => (
                <div key={idx} className="category-bar-item" data-testid="category-bar-item">
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
