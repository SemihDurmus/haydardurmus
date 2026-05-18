import { useTranslation } from 'react-i18next';
import type { Painting } from '../types';
import { PaintingCard } from './PaintingCard';
import { Typography } from '@shared/ui/Typography';
import { cn } from '@shared/utils/cn';

interface PaintingGridProps {
  paintings: Painting[];
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
  columns?: 2 | 3 | 4;
}

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

function PaintingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

export function PaintingGrid({
  paintings,
  isLoading = false,
  className,
  variant = 'default',
  columns = 4,
}: PaintingGridProps) {
  const { t } = useTranslation('paintings');

  if (isLoading) {
    return (
      <div className={cn('grid gap-6', columnClasses[columns], className)}>
        {Array.from({ length: columns * 3 }).map((_, i) => (
          <PaintingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Typography level="h3" tone="secondary" align="center" className="mb-2">
          {t('filters.noResults')}
        </Typography>
        <Typography level="body-sm" tone="tertiary" align="center">
          {t('filters.clear')}
        </Typography>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {paintings.map((painting) => (
        <PaintingCard key={painting.id} painting={painting} variant={variant} />
      ))}
    </div>
  );
}
