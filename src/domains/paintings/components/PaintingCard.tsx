import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Painting } from '../types';
import { formatDimensions, getPaintingDisplayName } from '@shared/utils/format';
import { getLookupLabel, techniques, materials } from '../data/lookups';
import { formatTechniqueMaterial } from '../utils/formatTechniqueMaterial';
import { isRadiusOnlyPainting } from '../utils/isRadiusOnlyPainting';
import { buildRoute } from '@app/router/routes';
import { cn } from '@shared/utils/cn';
import { PaintingImage } from './PaintingImage';

interface PaintingCardProps {
  painting: Painting;
  variant?: 'default' | 'compact';
  className?: string;
}

export function PaintingCard({ painting, variant = 'default', className }: PaintingCardProps) {
  const { t, i18n } = useTranslation('paintings');
  const location = useLocation();
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';

  const displayName = getPaintingDisplayName(painting.paintingName, t('card.untitled'));
  const metadataTitle = `${painting.paintingNo}${painting.paintingName ? ` - ${painting.paintingName}` : ''}`;
  const technique = getLookupLabel(techniques, painting.techniqueId, locale);
  const material = getLookupLabel(materials, painting.materialId, locale);
  const techniqueMaterial = formatTechniqueMaterial(technique, material, locale);
  const dimensions = formatDimensions(painting.width, painting.height, painting.radius);
  const showFullImage = isRadiusOnlyPainting(painting);

  return (
    <Link
      to={{ pathname: buildRoute.paintingDetail(painting.id), search: location.search }}
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
        <PaintingImage
          paintingNo={painting.paintingNo}
          alt={displayName}
          title={displayName}
          fit={showFullImage ? 'contain' : 'cover'}
          className="h-full w-full transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
          fallback={
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
          }
        />
      </div>

      {/* Metadata */}
      {variant === 'default' && (
        <div className="mt-4 space-y-1">
          <p className="truncate font-serif text-h4 leading-tight">{metadataTitle}</p>

          {painting.year && (
            <p className="font-sans text-body-sm text-text-tertiary">{painting.year}</p>
          )}

          {techniqueMaterial && (
            <p className="font-sans text-body-sm text-text-secondary">{techniqueMaterial}</p>
          )}

          <p className="font-sans text-body-sm text-text-tertiary">{dimensions}</p>
        </div>
      )}
    </Link>
  );
}
