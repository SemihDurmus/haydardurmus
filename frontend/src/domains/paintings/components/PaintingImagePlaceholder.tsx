import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

interface PaintingImagePlaceholderProps {
  className?: string;
  /** Pulsing grey fill, for a loading skeleton. Off by default (real "no image" fallback). */
  animate?: boolean;
  children?: ReactNode;
}

/**
 * The painting-shaped box shown in place of a real image — used both when a
 * painting genuinely has no photo (PaintingImageFrame) and for the painting
 * detail page's loading skeleton, so the two are guaranteed to be the same
 * size instead of relying on two places hand-matching class names.
 */
export function PaintingImagePlaceholder({
  className,
  animate = false,
  children,
}: PaintingImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center',
        // Only the real "no image" fallback gets the muted band around the
        // narrower box — for the loading skeleton it just reads as a second,
        // mismatched rectangle behind the pulsing one, so leave it transparent.
        !animate && 'bg-muted',
        className
      )}
    >
      <div
        className={cn(
          'relative aspect-[3/4] w-full max-w-sm',
          animate && 'animate-pulse bg-grey-20'
        )}
      >
        {children}
      </div>
    </div>
  );
}
