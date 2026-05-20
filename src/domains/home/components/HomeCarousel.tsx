import { useEffect, useMemo, useState } from 'react';
import { Typography } from '@shared/ui/Typography';
import { cn } from '@shared/utils/cn';

type ImageModule = string;

const carouselImageModules = import.meta.glob<ImageModule>(
  '/src/assets/home-page-caroussel/*.{jpg,jpeg,png,webp,avif,gif}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  }
);

const carouselImages = Object.entries(carouselImageModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, undefined, { numeric: true }))
  .map(([path, src]) => ({
    src,
    alt: path
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ') ?? 'Carousel artwork',
  }));

interface HomeCarouselProps {
  intervalMs?: number;
  className?: string;
}

export function HomeCarousel({ intervalMs = 3000, className }: HomeCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = useMemo(() => carouselImages, []);

  useEffect(() => {
    if (images.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [images.length, intervalMs]);

  if (images.length === 0) {
    return (
      <section
        className={cn(
          'flex min-h-[60vh] w-full items-center justify-center bg-muted px-4 text-center',
          className
        )}
        aria-label="Artwork carousel"
      >
        <Typography level="body-sm" tone="tertiary">
          Add images to src/assets/home-page-caroussel to display the home carousel.
        </Typography>
      </section>
    );
  }

  return (
    <section
      className={cn('relative h-[70vh] min-h-[28rem] w-full overflow-hidden', className)}
      aria-label="Artwork carousel"
    >
      {images.map((image, index) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out',
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          )}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-2 w-2 rounded-full border border-white/80 transition-colors',
                index === activeIndex ? 'bg-white' : 'bg-transparent'
              )}
              aria-label={`Show carousel image ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
