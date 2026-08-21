import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { getPaginationRange } from '@shared/utils/pagination';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation('common');

  if (totalPages <= 1) return null;

  const range = getPaginationRange(currentPage, totalPages);

  return (
    <nav aria-label={t('pagination.page', { page: currentPage })} className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        aria-label={t('pagination.previous')}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded text-text-tertiary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {range.map((token, i) =>
        token === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            aria-label={t('pagination.morePages')}
            className="flex h-9 w-9 items-center justify-center text-text-tertiary"
          >
            …
          </span>
        ) : (
          <button
            key={token}
            type="button"
            aria-label={t('pagination.page', { page: token })}
            aria-current={token === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(token)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded font-sans text-body-sm transition-colors',
              token === currentPage
                ? 'bg-primary-900 text-text-inverted'
                : 'text-text-tertiary hover:text-text-primary'
            )}
          >
            {token}
          </button>
        )
      )}

      <button
        type="button"
        aria-label={t('pagination.next')}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded text-text-tertiary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
