import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

interface PaintingImageProps {
  /** Backend image URL. When absent (no uploaded image) the fallback shows. */
  src?: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  fit?: 'cover' | 'contain';
  height?: number;
  loading?: 'eager' | 'lazy';
  onLoad?: ImgHTMLAttributes<HTMLImageElement>['onLoad'];
  /** Fires when the fallback is showing — no src, or the image failed to load. */
  onFallback?: () => void;
  title?: string;
  width?: number;
}

/**
 * Renders a painting photo served by our backend (public/paintings/<id>/...).
 * No external CDN: the URL comes from the painting record's image list. If there
 * is no image (or it fails to load) the provided fallback is shown instead.
 */
export function PaintingImage({
  src,
  alt,
  className,
  fallback,
  fit = 'cover',
  height,
  loading = 'lazy',
  onLoad,
  onFallback,
  title,
  width,
}: PaintingImageProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Most uploads on ImageKit are actually named `.JPG`, but URLs are built
  // assuming lowercase `.jpg` (case-sensitive storage) — retry with `.JPG`
  // once before falling back, instead of just failing. Reset synchronously
  // during render when `src` changes (React's recommended alternative to an
  // effect for adjusting state from a prop).
  if (src !== prevSrc) {
    setPrevSrc(src);
    setCurrentSrc(src);
    setHasError(false);
  }

  const showingFallback = !currentSrc || hasError;

  // Told via effect, not during render — the parent (PaintingImageFrame)
  // uses this to size the frame like a real image instead of shrinking to
  // fit just the fallback content.
  useEffect(() => {
    if (showingFallback) onFallback?.();
  }, [showingFallback, onFallback]);

  if (showingFallback) return <>{fallback ?? null}</>;

  return (
    <img
      src={currentSrc}
      width={width}
      height={height}
      alt={alt}
      title={title}
      className={cn(fit === 'contain' ? 'object-contain' : 'object-cover', className)}
      loading={loading}
      onLoad={onLoad}
      onError={() => {
        if (currentSrc.endsWith('.jpg')) {
          setCurrentSrc(`${currentSrc.slice(0, -4)}.JPG`);
        } else {
          setHasError(true);
        }
      }}
    />
  );
}
