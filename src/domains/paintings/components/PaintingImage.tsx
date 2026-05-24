import { useState, type ReactNode } from 'react';
import { Image } from '@imagekit/react';

const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/haydardurmus';

interface PaintingImageProps {
  paintingNo: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  height?: number;
  loading?: 'eager' | 'lazy';
  title?: string;
  width?: number;
}

export function PaintingImage({
  paintingNo,
  alt,
  className,
  fallback,
  height = 667,
  loading = 'lazy',
  title,
  width = 500,
}: PaintingImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) return fallback;

  return (
    <Image
      urlEndpoint={IMAGEKIT_URL_ENDPOINT}
      src={`/${paintingNo}.jpg`}
      width={width}
      height={height}
      alt={alt}
      title={title}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
}
