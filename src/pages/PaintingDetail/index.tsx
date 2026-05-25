import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Expand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { usePainting } from '@domains/paintings/hooks/usePaintings';
import { PaintingImageFrame } from '@domains/paintings/components/PaintingImageFrame';
import { PaintingLightbox } from '@domains/paintings/components/PaintingLightbox';
import { getLookupLabel, techniques, materials } from '@domains/paintings/data/lookups';
import { formatDimensions, formatYear, getPaintingDisplayName } from '@shared/utils/format';
import { ROUTES } from '@app/router/routes';

export default function PaintingDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation(['paintings', 'common']);
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';
  const { data: painting, isLoading } = usePainting(id);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (isLoading) {
    return (
      <Section spacing="none" className="pb-8 pt-4 md:pt-6">
        <Container width="wide">
          <div className="h-96 animate-pulse rounded bg-muted" />
        </Container>
      </Section>
    );
  }

  if (!painting) {
    return (
      <Section spacing="none" className="pb-8 pt-4 md:pt-6">
        <Container width="wide">
          <Link
            to={ROUTES.PAINTINGS}
            className="mb-4 flex items-center gap-2 font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('page.title')}
          </Link>
          <Typography level="h2">Painting not found.</Typography>
        </Container>
      </Section>
    );
  }

  const displayName = getPaintingDisplayName(painting.paintingName, t('card.untitled'));
  const technique = getLookupLabel(techniques, painting.techniqueId, locale);
  const material = getLookupLabel(materials, painting.materialId, locale);
  const dimensions = formatDimensions(painting.width, painting.height, painting.radius);
  const year = formatYear(painting.year, '—');

  const metaItems = [
    { label: t('detail.year'), value: year },
    { label: t('detail.technique'), value: technique },
    { label: t('detail.material'), value: material },
    { label: t('detail.dimensions'), value: dimensions },
  ].filter((item) => item.value);

  return (
    <>
      <Section spacing="none" background="default" className="pb-8 pt-4 md:pb-section-sm md:pt-6">
        <Container width="wide">
          <Link
            to={ROUTES.PAINTINGS}
            className="mb-4 flex items-center gap-2 font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('page.title')}
          </Link>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12 lg:pt-4">
            {/* Image — frame matches painting aspect ratio (no letterbox bars) */}
            <PaintingImageFrame
              className="max-h-[70dvh]"
              paintingNo={painting.paintingNo}
              alt={displayName}
              title={displayName}
              loading="eager"
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <Typography level="h3" tone="tertiary">
                    {painting.paintingNo}
                  </Typography>
                </div>
              }
              overlay={
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label={t('detail.viewFullSize')}
                  className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary-950/60 text-white transition-colors hover:bg-primary-950/80"
                >
                  <Expand className="h-4 w-4" aria-hidden />
                </button>
              }
            />

            {/* Details */}
            <div className="flex flex-col justify-center">
              <Typography level="overline" tone="tertiary" className="mb-2 block normal-case">
                {t('detail.paintingNumber', { number: painting.paintingNo })}
              </Typography>
              <Typography level="h1" className="mb-8">
                {displayName}
              </Typography>

              <dl className="space-y-4 border-t border-border pt-6">
                {metaItems.map(({ label, value }) => (
                  <div key={label} className="flex gap-4">
                    <dt className="w-32 shrink-0 font-sans text-body-sm text-text-tertiary">
                      {label}
                    </dt>
                    <dd className="font-sans text-body-sm text-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      {isLightboxOpen && (
        <PaintingLightbox
          paintingNo={painting.paintingNo}
          alt={displayName}
          title={displayName}
          closeLabel={t('actions.close', { ns: 'common' })}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
