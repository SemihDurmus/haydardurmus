import { useCallback, useEffect, useState, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';
import { PaintingImage } from './PaintingImage';

const LIGHTBOX_PADDING_PX = 8;

interface PaintingLightboxProps {
  src?: string;
  alt: string;
  title: string;
  closeLabel: string;
  onClose: () => void;
}

function getMaxLightboxSize() {
  return {
    width: window.innerWidth - LIGHTBOX_PADDING_PX * 2,
    height: window.innerHeight - LIGHTBOX_PADDING_PX * 2,
  };
}

export function PaintingLightbox(props: PaintingLightboxProps) {
  // Remount the content when the image source changes so the measured frame
  // size resets for the new image.
  return <PaintingLightboxContent key={props.src ?? 'no-src'} {...props} />;
}

function PaintingLightboxContent({
  src,
  alt,
  title,
  closeLabel,
  onClose,
}: PaintingLightboxProps) {
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleImageLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const { width: maxWidth, height: maxHeight } = getMaxLightboxSize();
    const scale = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight, 1);

    setFrameSize({
      width: Math.round(img.naturalWidth * scale),
      height: Math.round(img.naturalHeight * scale),
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/90"
      style={{ padding: LIGHTBOX_PADDING_PX }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="relative shrink-0"
        style={
          frameSize
            ? { width: frameSize.width, height: frameSize.height }
            : { width: 0, height: 0, overflow: 'hidden' }
        }
        onClick={(event) => event.stopPropagation()}
      >
        <PaintingImage
          src={src}
          alt={alt}
          title={title}
          width={2400}
          height={3200}
          fit="contain"
          className="block h-full w-full"
          loading="eager"
          onLoad={handleImageLoad}
        />
        {frameSize && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
