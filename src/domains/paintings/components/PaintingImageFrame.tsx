import { useCallback, useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';
import { cn } from '@shared/utils/cn';
import { PaintingImage } from './PaintingImage';

interface PaintingImageFrameProps {
  paintingNo: string;
  alt: string;
  title: string;
  className?: string;
  fallback?: ReactNode;
  imageHeight?: number;
  imageWidth?: number;
  loading?: 'eager' | 'lazy';
  overlay?: ReactNode;
}

export function PaintingImageFrame({
  paintingNo,
  alt,
  title,
  className,
  fallback,
  imageHeight = 1200,
  imageWidth = 900,
  loading = 'lazy',
  overlay,
}: PaintingImageFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const naturalSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);

  const updateFrameSize = useCallback(() => {
    const container = containerRef.current;
    const naturalSize = naturalSizeRef.current;
    if (!container || !naturalSize) return;

    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;
    const scale = Math.min(
      maxWidth / naturalSize.width,
      maxHeight / naturalSize.height,
      1
    );

    setFrameSize({
      width: Math.round(naturalSize.width * scale),
      height: Math.round(naturalSize.height * scale),
    });
  }, []);

  useEffect(() => {
    naturalSizeRef.current = null;
    setFrameSize(null);
  }, [paintingNo]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => updateFrameSize());
    observer.observe(container);

    return () => observer.disconnect();
  }, [updateFrameSize]);

  const handleImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      naturalSizeRef.current = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      updateFrameSize();
    },
    [updateFrameSize]
  );

  return (
    <div ref={containerRef} className={cn('flex items-center justify-center', className)}>
      <div
        className="relative shrink-0"
        style={
          frameSize
            ? { width: frameSize.width, height: frameSize.height }
            : { maxHeight: '100%', maxWidth: '100%' }
        }
      >
        <PaintingImage
          paintingNo={paintingNo}
          alt={alt}
          title={title}
          width={imageWidth}
          height={imageHeight}
          fit="contain"
          className="block h-full w-full"
          loading={loading}
          fallback={fallback}
          onLoad={handleImageLoad}
        />
        {overlay}
      </div>
    </div>
  );
}
