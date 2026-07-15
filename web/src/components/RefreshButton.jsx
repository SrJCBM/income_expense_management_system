import '../styles/components/RefreshButton.css';

const RefreshButton = ({ onRefresh, isRefreshing = false, disabled = false }) => (
  <button
    type="button"
    className="btn-secondary refresh-button"
    onClick={onRefresh}
    disabled={disabled || isRefreshing}
    aria-busy={isRefreshing}
    aria-label={isRefreshing ? 'Actualizando datos' : 'Actualizar datos'}
    data-testid="refresh-button"
  >
    {isRefreshing ? 'Actualizando…' : 'Actualizar'}
  </button>
);

export default RefreshButton;
