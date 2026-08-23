import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { PaintingNavTarget } from '../hooks/usePaintingGalleryNavigation';

/** Either a known destination (Link) or an async-resolved one (button + onClick). */
export interface NavStep {
  to?: PaintingNavTarget;
  onClick?: () => void;
  disabled?: boolean;
}

interface NavArrowProps extends NavStep {
  label: string;
  direction: 'prev' | 'next';
  className?: string;
}

function NavArrow({ to, onClick, disabled, label, direction, className }: NavArrowProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  const sharedClassName = cn(
    'flex h-10 w-10 items-center justify-center rounded-full',
    'bg-primary-950/60 text-white transition-colors hover:bg-primary-950/80',
    disabled && 'pointer-events-none opacity-60',
    className
  );

  if (to) {
    return (
      <Link to={to} aria-label={label} className={sharedClassName}>
        <Icon className="h-5 w-5" aria-hidden />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(sharedClassName, disabled && 'cursor-wait')}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}

interface PaintingDetailNavigationProps {
  prev: NavStep | null;
  next: NavStep | null;
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
        <NavArrow {...prev} label={prevLabel} direction="prev" />
      ) : (
        <span className="w-10" aria-hidden />
      )}
      {next ? (
        <NavArrow {...next} label={nextLabel} direction="next" />
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
