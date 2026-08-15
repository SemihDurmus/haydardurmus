import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { PageTitle } from '@shared/ui/PageTitle';
import { SectionTitle } from '@shared/ui/SectionTitle';
import { mockCollections } from '@domains/collection/types';
import { buildRoute } from '@app/router/routes';
import { useTranslatedText } from '@shared/hooks/useTranslatedText';
import type { Collection } from '@domains/collection/types';

function CollectionCard({ collection }: { collection: Collection }) {
  const { t } = useTranslation('collections');
  const title = useTranslatedText(collection.title);
  const description = useTranslatedText(collection.description);

  return (
    <Link to={buildRoute.collectionDetail(collection.id)} className="group block">
      {/* Cover image placeholder */}
      <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-muted">
        {collection.coverImage.src ? (
          <img
            src={collection.coverImage.src}
            alt={collection.coverImage.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Typography level="h3" tone="tertiary">
              {title}
            </Typography>
          </div>
        )}
      </div>

      <Typography level="overline" tone="tertiary" className="mb-1 block">
        {collection.year ?? ''}
        {' · '}
        {t('card.works', { count: collection.paintingIds.length })}
      </Typography>
      <Typography level="h3" className="mb-2 transition-colors group-hover:text-accent">
        {title}
      </Typography>
      <Typography level="body-sm" tone="secondary" className="line-clamp-2">
        {description}
      </Typography>
    </Link>
  );
}

export default function CollectionPage() {
  const { t } = useTranslation('collections');

  return (
    <>
      {/* Page header */}
      <Section spacing="none" background="default" className="pb-4 pt-6 md:pt-section-sm">
        <Container width="wide">
          <div>
            <PageTitle className="mb-4">{t('page.title')}</PageTitle>
            <SectionTitle style={{ marginBottom: 0 }}>{t('page.subtitle')}</SectionTitle>
          </div>
        </Container>
      </Section>
      {/* Content */}
      <Section spacing="lg" background="default" className="pt-8">
        <Container width="wide">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {mockCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
