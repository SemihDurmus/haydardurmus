import { useCallback, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ImageAsset } from '@shared/types';
import { cn } from '@shared/utils/cn';
import { PaintingImageFrame } from './PaintingImageFrame';

interface PaintingImageGalleryProps {
  images: ImageAsset[];
  /** Index of the image currently shown. Owned by the parent so the lightbox
   *  can open on the same image the visitor is looking at. */
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  alt: string;
  title: string;
  fallback?: ReactNode;
  /** Rendered on top of the image — the expand-to-lightbox button. */
  overlay?: ReactNode;
  previousLabel: string;
  nextLabel: string;
  thumbnailLabel: (position: number) => string;
  className?: string;
}

const arrowClass =
  'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center ' +
  'rounded-full bg-primary-950/60 text-white transition-colors hover:bg-primary-950/80 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-white';

/**
 * The painting's images: one large frame, arrows to step through them, and a
 * thumbnail strip underneath.
 *
 * A painting can have any number of images (the admin panel uploads as many as
 * you like, primary first). With only one image the arrows and the strip are
 * omitted entirely, so single-image works look exactly as they did before.
 *
 * Not to be confused with PaintingDetailNavigation, which moves between
 * *paintings*; this moves between images of the same painting.
 */
export function PaintingImageGallery({
  images,
  activeIndex,
  onActiveIndexChange,
  alt,
  title,
  fallback,
  overlay,
  previousLabel,
  nextLabel,
  thumbnailLabel,
  className,
}: PaintingImageGalleryProps) {
  const count = images.length;
  const hasMultiple = count > 1;

  // Wrap around at both ends: from the last image, "next" returns to the first.
  const step = useCallback(
    (delta: number) => {
      if (!hasMultiple) return;
      onActiveIndexChange((activeIndex + delta + count) % count);
    },
    [activeIndex, count, hasMultiple, onActiveIndexChange],
  );

  // Arrow keys move through the images, matching what the on-screen buttons do.
  useEffect(() => {
    if (!hasMultiple) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'ArrowRight') step(1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasMultiple, step]);

  // Guard against an out-of-range index — e.g. the active image was deleted in
  // the admin panel while this page was open.
  const safeIndex = activeIndex >= 0 && activeIndex < count ? activeIndex : 0;
  const current = images[safeIndex];

  return (
    <div className={className}>
      <div className="relative w-full">
        <PaintingImageFrame
          className="max-h-[70dvh]"
          src={current?.src}
          alt={current?.alt || alt}
          title={title}
          loading="eager"
          fallback={fallback}
          overlay={
            <>
              {overlay}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label={previousLabel}
                    className={cn(arrowClass, 'left-2')}
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label={nextLabel}
                    className={cn(arrowClass, 'right-2')}
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </>
              )}
            </>
          }
        />
      </div>

      {hasMultiple && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {images.map((image, index) => {
            const isActive = index === safeIndex;
            return (
              <li key={image.src}>
                <button
                  type="button"
                  onClick={() => onActiveIndexChange(index)}
                  aria-label={thumbnailLabel(index + 1)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'block h-16 w-16 overflow-hidden border transition-colors',
                    isActive
                      ? 'border-primary-700'
                      : 'border-border opacity-70 hover:opacity-100',
                  )}
                >
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
