import { useMemo } from 'react';
import { toDateInputValue } from '../utils/dateUtils.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const ExpenseList = ({ expenses, isLoading, error, onEdit, onDuplicate, onDelete }) => {
  const { formatCurrency } = useSettings();
  const { t } = useLanguage();
  const total = useMemo(
    () => (expenses || []).reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0),
    [expenses]
  );

  if (isLoading) {
    return (
      <div className="expense-list-loading" data-testid="expense-loading">
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" data-testid="expense-list-error">
        {t('expenses.errorLoad')} {error}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state" data-testid="expense-empty">
        <div className="empty-icon">📭</div>
        <h3>{t('expenses.emptyTitle')}</h3>
        <p className="hint">{t('expenses.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="expense-list" data-testid="expense-list">
      <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t('expenses.colDate')}</th>
            <th>{t('expenses.colConcept')}</th>
            <th>{t('expenses.colCategory')}</th>
            <th>{t('expenses.colAmount')}</th>
            <th>{t('expenses.colActions')}</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id || expense._id} data-testid="expense-item">
              <td data-label={t('expenses.colDate')}>{toDateInputValue(expense.date)}</td>
              <td data-label={t('expenses.colConcept')}>{expense.concept}</td>
              <td data-label={t('expenses.colCategory')}>{expense.category?.name || t('expenses.noCategory')}</td>
              <td className="amount negative" data-label={t('expenses.colAmount')}>-{formatCurrency(expense.amount)}</td>
              <td className="actions-cell" data-label={t('expenses.colActions')}>
                <button
                  type="button"
                  className="btn-icon btn-edit"
                  onClick={() => onEdit(expense)}
                  title={t('expenses.editTitle')}
                  data-testid="edit-expense"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="btn-icon btn-duplicate"
                  onClick={() => onDuplicate(expense)}
                  title={t('expenses.duplicateTitle')}
                  aria-label={`${t('expenses.duplicateLabel')}: ${expense.concept}`}
                  data-testid="duplicate-expense"
                >
                  📋
                </button>
                <button
                  type="button"
                  className="btn-icon btn-delete"
                  onClick={() => onDelete(expense.id || expense._id)}
                  title={t('expenses.deleteTitle')}
                  data-testid="delete-expense"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="3" className="total-label">{t('expenses.totalLabel')}</td>
            <td className="amount negative" data-testid="expense-total">
              -{formatCurrency(total)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      </div>
    </div>
  );
};

export default ExpenseList;
