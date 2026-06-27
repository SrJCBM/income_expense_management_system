const Pagination = ({ page, totalPages, onPageChange, disabled = false }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination" role="navigation" aria-label="Paginación">
      <button
        type="button"
        className="btn-secondary btn-filter"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>
      <span className="pagination-info" aria-current="page">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className="btn-secondary btn-filter"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>
    </div>
  );
};

export default Pagination;
