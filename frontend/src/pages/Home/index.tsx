import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { PageTitle } from '@shared/ui/PageTitle';
import { cn } from '@shared/utils/cn';
import { ROUTES } from '@app/router/routes';
import { HomeCarousel } from '@domains/home/components/HomeCarousel';
import { FeaturedPaintingImages } from '@domains/home/components/FeaturedPaintingImages';
import { useFeaturedPaintings } from '@domains/paintings/hooks/usePaintings';

export default function HomePage() {
  const { t } = useTranslation('home');
  const {
    data: featuredPaintings,
    isLoading: featuredLoading,
    isFetching: featuredFetching,
    refetch: refetchFeatured,
  } = useFeaturedPaintings(12);

  return (
    <>
      <Section spacing="none" background="default" className="py-6 md:py-8">
        <Container width="wide">
          <PageTitle align="center">Haydar Durmuş</PageTitle>
        </Container>
      </Section>

      <HomeCarousel />

      <Section spacing="none" background="default" className="py-10 md:py-14">
        <Container width="narrow">
          <Typography level="body-lg" tone="secondary" align="center" className="text-pretty">
            {t('hero.intro')}
          </Typography>
        </Container>
      </Section>

      {/* Featured Paintings */}
      <Section spacing="none" background="muted" className="pb-section-md pt-8 md:pb-section-lg">
        <Container width="wide">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => refetchFeatured()}
              disabled={featuredFetching}
              className="flex items-center gap-2 font-sans text-body-sm text-text-secondary transition-colors hover:text-text-primary disabled:cursor-wait disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', featuredFetching && 'animate-spin')} />
              {t('featured.refresh')}
            </button>
            <Link
              to={ROUTES.PAINTINGS}
              className="flex items-center gap-2 font-sans text-body-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {t('latest.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <FeaturedPaintingImages paintings={featuredPaintings ?? []} isLoading={featuredLoading} />
        </Container>
      </Section>
    </>
  );
}
