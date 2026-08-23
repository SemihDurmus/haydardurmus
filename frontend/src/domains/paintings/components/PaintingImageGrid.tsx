import { Link } from 'react-router';
import { PaintingImage } from '@domains/paintings/components/PaintingImage';
import { isRadiusOnlyPainting } from '@domains/paintings/utils/isRadiusOnlyPainting';
import type { Painting } from '../types';

export interface PaintingImageGridProps {
  paintings: Painting[];
  /** Hover overlay text. Defaults to the catalogue number ("#1234"). */
  overlayLabel?: (painting: Painting) => string;
  /** When given, each cell links there (e.g. the painting's detail page). */
  linkTo?: (painting: Painting) => string;
}

/**
 * A grid of painting images with a hover overlay — shared by the home page's
 * Featured Paintings section and the Collection page's Gallery tab, so both
 * present paintings identically (callers can override the overlay text and
 * add a click-through link where it makes sense).
 */
export function PaintingImageGrid({ paintings, overlayLabel, linkTo }: PaintingImageGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {paintings.map((painting) => {
        const label = overlayLabel ? overlayLabel(painting) : `#${painting.paintingNo}`;
        const cellClassName = 'group relative aspect-[3/4] overflow-hidden bg-muted';
        const content = (
          <>
            <PaintingImage
              src={painting.images?.[0]?.src}
              alt={painting.paintingNo || 'Painting'}
              title={painting.paintingNo || 'Painting'}
              fit={isRadiusOnlyPainting(painting) ? 'contain' : 'cover'}
              className="h-full w-full"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-primary-950/70 px-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-center font-heading text-[20px] text-white">{label}</span>
            </div>
          </>
        );

        return linkTo ? (
          <Link key={painting.id} to={linkTo(painting)} className={cellClassName}>
            {content}
          </Link>
        ) : (
          <div key={painting.id} className={cellClassName}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
