import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Painting } from '../types';
import { formatDimensions, formatYear, getPaintingDisplayName } from '@shared/utils/format';
import { getLookupLabel, techniques, materials } from '../data/lookups';
import { buildRoute } from '@app/router/routes';
import { cn } from '@shared/utils/cn';

interface PaintingCardProps {
  painting: Painting;
  variant?: 'default' | 'compact';
  className?: string;
}

export function PaintingCard({ painting, variant = 'default', className }: PaintingCardProps) {
  const { t, i18n } = useTranslation('paintings');
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';

  const displayName = getPaintingDisplayName(painting.paintingName, painting.paintingNo, t('card.untitled'));
  const technique = getLookupLabel(techniques, painting.techniqueId, locale);
  const material = getLookupLabel(materials, painting.materialId, locale);
  const dimensions = formatDimensions(painting.width, painting.height, painting.radius);
  const year = formatYear(painting.year, '—');

  return (
    <Link
      to={buildRoute.paintingDetail(painting.id)}
      className={cn('group block', className)}
      aria-label={`View ${displayName}`}
    >
      {/* Image area */}
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          variant === 'compact' ? 'aspect-square' : 'aspect-[3/4]'
        )}
      >
        {painting.images?.[0] ? (
          <img
            src={painting.images[0].src}
            alt={painting.images[0].alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
          />
        ) : (
          // Placeholder when no image is available
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
            <span className="font-sans text-label uppercase tracking-widest text-text-tertiary">
              {painting.paintingNo}
            </span>
            {painting.paintingName && (
              <span className="text-center font-serif text-body-sm text-text-secondary">
                {painting.paintingName}
              </span>
            )}
          </div>
        )}

        {/* Year badge — top left */}
        {painting.year && (
          <span className="absolute left-3 top-3 bg-background/90 px-2 py-1 font-sans text-caption text-text-secondary backdrop-blur-sm">
            {year}
          </span>
        )}
      </div>

      {/* Metadata */}
      {variant === 'default' && (
        <div className="mt-4 space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-serif text-h4 leading-tight">{displayName}</p>
            <span className="shrink-0 font-sans text-caption text-text-tertiary">
              {painting.paintingNo}
            </span>
          </div>

          {(technique || material) && (
            <p className="font-sans text-body-sm text-text-secondary">
              {[technique, material].filter(Boolean).join(', ')}
            </p>
          )}

          <p className="font-sans text-body-sm text-text-tertiary">{dimensions}</p>
        </div>
      )}
    </Link>
  );
}
