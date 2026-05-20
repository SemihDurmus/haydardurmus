import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { Button } from '@shared/ui/Button';
import { PaintingGrid } from '@domains/paintings/components/PaintingGrid';
import { useFeaturedPaintings } from '@domains/paintings/hooks/usePaintings';
import { ROUTES } from '@app/router/routes';
import { artistBiography } from '@domains/biography/types';
import { useTranslatedText } from '@shared/hooks/useTranslatedText';
import { HomeCarousel } from '@domains/home/components/HomeCarousel';

export default function HomePage() {
  const { t } = useTranslation('home');
  const { data: featured, isLoading } = useFeaturedPaintings(6);
  const shortBio = useTranslatedText(artistBiography.shortBio);

  return (
    <>
      <Section spacing="none" background="default" className="py-6 md:py-8">
        <Container width="wide">
          <Typography
            level="h1"
            align="center"
            className="leading-tight"
            style={{
              color: '#2971A6',
              fontFamily: 'Oswald, Inter, system-ui, sans-serif',
              fontSize: 'clamp(32px, 5vw, 50px)',
            }}
          >
            Haydar Durmuş
          </Typography>
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

      {/* Hero */}
      <Section spacing="none" background="default" className="relative flex min-h-[90vh] flex-col justify-end pb-section-md pt-32">
        <Container width="wide">
          <div className="max-w-container-sm">
            <Typography level="overline" tone="tertiary" className="mb-6 block">
              {t('hero.tagline')}
            </Typography>
            <div className="flex flex-wrap items-center gap-4">
              <Button as={Link} to={ROUTES.PAINTINGS} size="lg">
                {t('latest.cta')}
              </Button>
              <Button as={Link} to={ROUTES.BIOGRAPHY} variant="ghost" size="lg">
                {t('about.cta')}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured Paintings */}
      <Section spacing="lg" background="muted">
        <Container width="wide">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <Typography level="overline" tone="tertiary" className="mb-2 block">
                {t('featured.subtitle')}
              </Typography>
              <Typography level="h2">{t('featured.title')}</Typography>
            </div>
            <Link
              to={ROUTES.PAINTINGS}
              className="flex items-center gap-2 font-sans text-body-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {t('latest.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <PaintingGrid paintings={featured ?? []} isLoading={isLoading} columns={3} />
        </Container>
      </Section>

      {/* About snippet */}
      <Section spacing="lg" background="default">
        <Container width="narrow">
          <Typography level="overline" tone="tertiary" className="mb-4 block">
            {t('about.label')}
          </Typography>
          <Typography level="h2" className="mb-8">
            {artistBiography.name}
          </Typography>
          <Typography level="body-lg" tone="secondary" className="mb-8 text-pretty">
            {shortBio}
          </Typography>
          <Button as={Link} to={ROUTES.BIOGRAPHY} variant="secondary">
            {t('about.cta')}
          </Button>
        </Container>
      </Section>
    </>
  );
}
