import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const btn =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 hover:border-signal/40 hover:text-signal active:scale-95 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div className="flex items-center justify-between border-t border-line/60 pt-4">
      <p className="tabular text-xs text-faint">
        {total} {total === 1 ? 'objeto' : 'objetos'} no total
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className={btn}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="tabular text-xs text-muted">
          {String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className={btn}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
