import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { PaintingNavTarget } from '../hooks/usePaintingGalleryNavigation';

interface NavArrowProps {
  to: PaintingNavTarget;
  label: string;
  direction: 'prev' | 'next';
  className?: string;
}

function NavArrow({ to, label, direction, className }: NavArrowProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full',
        'bg-primary-950/60 text-white transition-colors hover:bg-primary-950/80',
        className
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </Link>
  );
}

interface PaintingDetailNavigationProps {
  prev: { to: PaintingNavTarget } | null;
  next: { to: PaintingNavTarget } | null;
  prevLabel: string;
  nextLabel: string;
  /** Below image on small screens */
  variant: 'belowImage' | 'bar';
  className?: string;
}

function NavRow({
  prev,
  next,
  prevLabel,
  nextLabel,
}: Pick<PaintingDetailNavigationProps, 'prev' | 'next' | 'prevLabel' | 'nextLabel'>) {
  return (
    <>
      {prev ? (
        <NavArrow to={prev.to} label={prevLabel} direction="prev" />
      ) : (
        <span className="w-10" aria-hidden />
      )}
      {next ? (
        <NavArrow to={next.to} label={nextLabel} direction="next" />
      ) : (
        <span className="w-10" aria-hidden />
      )}
    </>
  );
}

export function PaintingDetailNavigation({
  prev,
  next,
  prevLabel,
  nextLabel,
  variant,
  className,
}: PaintingDetailNavigationProps) {
  if (!prev && !next) return null;

  if (variant === 'belowImage') {
    return (
      <nav
        className={cn(
          'mt-4 flex items-center justify-center gap-8 lg:hidden',
          className
        )}
        aria-label={prevLabel}
      >
        <NavRow prev={prev} next={next} prevLabel={prevLabel} nextLabel={nextLabel} />
      </nav>
    );
  }

  return (
    <nav
      className={cn('mt-8 hidden items-center justify-center gap-8 lg:flex', className)}
      aria-label={prevLabel}
    >
      <NavRow prev={prev} next={next} prevLabel={prevLabel} nextLabel={nextLabel} />
    </nav>
  );
}
