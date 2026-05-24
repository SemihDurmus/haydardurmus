import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { usePainting } from '@domains/paintings/hooks/usePaintings';
import { PaintingImage } from '@domains/paintings/components/PaintingImage';
import { getLookupLabel, techniques, materials } from '@domains/paintings/data/lookups';
import { formatDimensions, formatYear, getPaintingDisplayName } from '@shared/utils/format';
import { ROUTES } from '@app/router/routes';

export default function PaintingDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('paintings');
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';
  const { data: painting, isLoading } = usePainting(id);

  if (isLoading) {
    return (
      <Section spacing="lg">
        <Container>
          <div className="h-96 animate-pulse rounded bg-muted" />
        </Container>
      </Section>
    );
  }

  if (!painting) {
    return (
      <Section spacing="lg">
        <Container>
          <Typography level="h2">Painting not found.</Typography>
          <Link to={ROUTES.PAINTINGS}>← {t('detail.relatedWorks')}</Link>
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
      <Section spacing="md" background="default" className="border-b border-border">
        <Container width="wide">
          <Link
            to={ROUTES.PAINTINGS}
            className="mb-8 flex items-center gap-2 font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('page.title')}
          </Link>
        </Container>
      </Section>

      <Section spacing="lg" background="default">
        <Container width="wide">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Image */}
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <PaintingImage
                paintingNo={painting.paintingNo}
                alt={displayName}
                title={displayName}
                width={900}
                height={1200}
                className="h-full w-full object-contain"
                loading="eager"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <Typography level="h3" tone="tertiary">
                      {painting.paintingNo}
                    </Typography>
                  </div>
                }
              />
            </div>

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
    </>
  );
}
