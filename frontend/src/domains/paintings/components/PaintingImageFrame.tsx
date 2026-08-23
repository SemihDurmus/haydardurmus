import { useCallback, useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';
import { cn } from '@shared/utils/cn';
import { PaintingImage } from './PaintingImage';
import { PaintingImagePlaceholder } from './PaintingImagePlaceholder';

interface PaintingImageFrameProps {
  src?: string;
  alt: string;
  title: string;
  className?: string;
  fallback?: ReactNode;
  imageHeight?: number;
  imageWidth?: number;
  loading?: 'eager' | 'lazy';
  overlay?: ReactNode;
}

function parseCssLengthToPx(value: string, container: HTMLElement): number {
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) return 0;

  if (value.endsWith('px')) return numeric;
  if (value.endsWith('dvh')) return (numeric / 100) * window.innerHeight;
  if (value.endsWith('vh')) return (numeric / 100) * document.documentElement.clientHeight;
  if (value.endsWith('vw')) return (numeric / 100) * document.documentElement.clientWidth;
  if (value.endsWith('%')) return (numeric / 100) * container.clientHeight;

  return numeric;
}

function getContainerBounds(container: HTMLElement) {
  const style = getComputedStyle(container);
  let maxWidth = container.clientWidth;
  let maxHeight = container.clientHeight;

  if (style.maxWidth && style.maxWidth !== 'none') {
    maxWidth = Math.min(maxWidth, parseCssLengthToPx(style.maxWidth, container));
  }

  if (maxHeight < 1 && style.maxHeight && style.maxHeight !== 'none') {
    maxHeight = parseCssLengthToPx(style.maxHeight, container);
  }

  if (maxHeight < 1) {
    maxHeight = Number.POSITIVE_INFINITY;
  }

  return { maxWidth, maxHeight };
}

export function PaintingImageFrame(props: PaintingImageFrameProps) {
  // Remount the inner frame when the image source changes so the measured
  // frame size and cached natural size reset for the new image.
  return <PaintingImageFrameInner key={props.src ?? 'no-src'} {...props} />;
}

function PaintingImageFrameInner({
  src,
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
  // Starts true when there's no src at all; also set once PaintingImage tells
  // us it fell back (e.g. the src 404s — every painting gets a guessed image
  // URL up front, so a missing photo isn't known until the request fails).
  const [noImage, setNoImage] = useState(!src);

  const updateFrameSize = useCallback(() => {
    const container = containerRef.current;
    const naturalSize = naturalSizeRef.current;
    if (!container || !naturalSize) return;

    const { maxWidth, maxHeight } = getContainerBounds(container);
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

  // No real image (as opposed to one still loading) — there's nothing to
  // measure, so `frameSize` would otherwise never be set and the frame would
  // shrink to fit just the fallback content (a single line of text) instead
  // of looking like a painting. Give it a fixed, painting-shaped size instead.
  // `overlay` is deliberately omitted here — it's the expand-to-lightbox
  // button (plus prev/next arrows, moot with zero images), and there's
  // nothing meaningful to expand when there's no real image.
  if (noImage) {
    return <PaintingImagePlaceholder className={className}>{fallback}</PaintingImagePlaceholder>;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex w-full items-center justify-center',
        !frameSize && 'bg-muted',
        className
      )}
    >
      <div
        className="relative shrink-0"
        style={
          frameSize
            ? { width: frameSize.width, height: frameSize.height }
            : { width: '100%', maxHeight: 'inherit' }
        }
      >
        <PaintingImage
          src={src}
          alt={alt}
          title={title}
          width={imageWidth}
          height={imageHeight}
          fit="contain"
          className="block h-full w-full"
          loading={loading}
          fallback={fallback}
          onLoad={handleImageLoad}
          onFallback={() => setNoImage(true)}
        />
        {overlay}
      </div>
    </div>
  );
}
