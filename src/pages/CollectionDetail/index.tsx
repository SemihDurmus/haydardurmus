import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { PaintingGrid } from '@domains/paintings/components/PaintingGrid';
import { mockCollections } from '@domains/collection/types';
import { mockPaintings } from '@domains/paintings/data/mockPaintings';
import { ROUTES } from '@app/router/routes';
import { useTranslatedText } from '@shared/hooks/useTranslatedText';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('collections');
  const collection = mockCollections.find((c) => c.id === id);
  const title = useTranslatedText(collection?.title ?? { en: '', tr: '' });
  const description = useTranslatedText(collection?.description ?? { en: '', tr: '' });

  if (!collection) {
    return (
      <Section spacing="lg">
        <Container>
          <Typography level="h2">Collection not found.</Typography>
          <Link to={ROUTES.COLLECTIONS}>← {t('detail.back')}</Link>
        </Container>
      </Section>
    );
  }

  const collectionPaintings = mockPaintings.filter((p) =>
    collection.paintingIds.includes(p.id)
  );

  return (
    <>
      <Section spacing="md" background="default" className="border-b border-border">
        <Container width="wide">
          <Link
            to={ROUTES.COLLECTIONS}
            className="mb-8 flex items-center gap-2 font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('detail.back')}
          </Link>
          <Typography level="overline" tone="tertiary" className="mb-2 block">
            {collection.year ?? ''} · {t('card.works', { count: collection.paintingIds.length })}
          </Typography>
          <Typography level="h1" className="mb-4">{title}</Typography>
          <Typography level="body-lg" tone="secondary" className="max-w-container-sm text-pretty">
            {description}
          </Typography>
        </Container>
      </Section>

      <Section spacing="lg" background="default">
        <Container width="wide">
          <Typography level="h2" className="mb-8">{t('detail.works')}</Typography>
          <PaintingGrid paintings={collectionPaintings} columns={3} />
        </Container>
      </Section>
    </>
  );
}
