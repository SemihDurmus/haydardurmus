import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';
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
  title,
  width,
}: PaintingImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) return <>{fallback ?? null}</>;

  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      title={title}
      className={cn(fit === 'contain' ? 'object-contain' : 'object-cover', className)}
      loading={loading}
      onLoad={onLoad}
      onError={() => setHasError(true)}
    />
  );
}
