import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Expand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { usePainting } from '@domains/paintings/hooks/usePaintings';
import { isMainArtist } from '@domains/artists/utils/isMainArtist';
import type { Artist } from '@domains/artists/api/artistsService';
import { usePaintingGalleryNavigation } from '@domains/paintings/hooks/usePaintingGalleryNavigation';
import { useArtistPaintingNavigation } from '@domains/paintings/hooks/useArtistPaintingNavigation';
import { paintingsService } from '@domains/paintings/api/paintingsService';
import { PaintingImageGallery } from '@domains/paintings/components/PaintingImageGallery';
import { PaintingImagePlaceholder } from '@domains/paintings/components/PaintingImagePlaceholder';
import { PaintingLightbox } from '@domains/paintings/components/PaintingLightbox';
import { PaintingDetailNavigation, type NavStep } from '@domains/paintings/components/PaintingDetailNavigation';
import { pickTranslated } from '@shared/hooks/useTranslatedText';
import { formatDimensions, formatYear, getPaintingDisplayName } from '@shared/utils/format';
import { ROUTES, buildRoute } from '@app/router/routes';

export default function PaintingDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  // Which Collection tab (Artists/Gallery) sent us here, if any — so the
  // back link returns to that tab instead of always defaulting to Artists.
  const collectionTab = searchParams.get('tab');
  // Reached from the home page's Selected Works — the back link should
  // return there instead of the paintings gallery.
  const fromHome = searchParams.get('from') === 'home';
  const { t, i18n } = useTranslation(['paintings', 'common', 'collections']);
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';
  const { data: painting, isLoading } = usePainting(id);
  const galleryNav = usePaintingGalleryNavigation(id);
  const artistNav = useArtistPaintingNavigation(painting?.artistNumericId);
  const navigate = useNavigate();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isNavigatingArtist, setIsNavigatingArtist] = useState(false);

  // Which of the painting's images is on show. The API returns them primary
  // first, so 0 is the card image.
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = painting?.images ?? [];

  // Moving to another painting (the prev/next painting links keep this page
  // mounted) must start again at its primary image.
  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  if (isLoading) {
    return (
      <Section spacing="none" background="default" className="pb-8 pt-4 md:pb-section-sm md:pt-6">
        <Container width="wide">
          <div className="mb-4 h-5 w-24 animate-pulse bg-grey-20" />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12 lg:pt-4">
            {/* Left — the same component PaintingImageFrame falls back to
                when a painting has no image, so this is guaranteed the same size. */}
            <PaintingImagePlaceholder animate />

            {/* Right — catalogue number, title, and meta rows */}
            <div className="flex flex-col justify-center">
              <div className="mb-2 h-3 w-36 animate-pulse bg-grey-20" />
              <div className="mb-8 h-8 w-3/4 animate-pulse bg-grey-20" />
              <div className="space-y-4 border-t border-border pt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 w-32 shrink-0 animate-pulse bg-grey-20" />
                    <div className="h-4 w-24 animate-pulse bg-grey-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
  // Collection paintings (any artist besides the gallery's own) currently
  // carry no real catalogue data — technique, material, dimensions, year are
  // all placeholders — so that info panel is hidden for them; the artist's
  // name is shown instead, since that's the only genuine info available.
  const mainArtist = isMainArtist(painting.artistNumericId);
  const technique = pickTranslated(painting.technique, locale);
  const material = pickTranslated(painting.material, locale);
  const dimensions = formatDimensions(painting.width, painting.height, painting.radius);
  const year = formatYear(painting.year, '—');

  const metaItems = [
    { label: t('detail.year'), value: year },
    { label: t('detail.technique'), value: technique },
    { label: t('detail.material'), value: material },
    { label: t('detail.dimensions'), value: dimensions },
  ].filter((item) => item.value);

  // Reached via the Collection page's Artists tab — step through artists
  // instead of the (main-gallery-only) prev/next painting nav, which never
  // applies to collection paintings anyway.
  const showArtistNav = collectionTab === 'artists' && !mainArtist && artistNav.showNavigation;

  const goToArtist = async (artist: Artist) => {
    if (isNavigatingArtist) return;
    setIsNavigatingArtist(true);
    try {
      const target = await paintingsService.getFirstByArtist(artist.id);
      if (target) navigate(`${buildRoute.paintingDetail(target.id)}?tab=artists`);
    } finally {
      setIsNavigatingArtist(false);
    }
  };

  const navPrev: NavStep | null = showArtistNav
    ? artistNav.prevArtist
      ? { onClick: () => goToArtist(artistNav.prevArtist!), disabled: isNavigatingArtist }
      : null
    : galleryNav.prev
      ? { to: galleryNav.prev.to }
      : null;
  const navNext: NavStep | null = showArtistNav
    ? artistNav.nextArtist
      ? { onClick: () => goToArtist(artistNav.nextArtist!), disabled: isNavigatingArtist }
      : null
    : galleryNav.next
      ? { to: galleryNav.next.to }
      : null;
  const navPrevLabel = showArtistNav ? t('detail.previousArtist') : t('detail.previousPainting');
  const navNextLabel = showArtistNav ? t('detail.nextArtist') : t('detail.nextPainting');
  const showNav = showArtistNav || galleryNav.showNavigation;

  return (
    <>
      <Section spacing="none" background="default" className="pb-8 pt-4 md:pb-section-sm md:pt-6">
        <Container width="wide">
          <Link
            to={
              mainArtist
                ? fromHome
                  ? ROUTES.HOME
                  : ROUTES.PAINTINGS
                : `${ROUTES.COLLECTIONS}${collectionTab ? `?tab=${collectionTab}` : ''}`
            }
            className="mb-4 flex items-center gap-2 font-sans text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {mainArtist
              ? fromHome
                ? t('nav.home', { ns: 'common' })
                : t('page.title')
              : t('page.title', { ns: 'collections' })}
          </Link>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12 lg:pt-4">
            {/* Images — frame matches painting aspect ratio (no letterbox bars).
                Arrows and thumbnails appear only when there's more than one. */}
            <div className="relative w-full">
              <PaintingImageGallery
                images={images}
                activeIndex={activeImageIndex}
                onActiveIndexChange={setActiveImageIndex}
                alt={displayName}
                title={displayName}
                previousLabel={t('detail.previousImage')}
                nextLabel={t('detail.nextImage')}
                thumbnailLabel={(position) => t('detail.showImage', { number: position })}
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <Typography level="h3" tone="tertiary">
                      #{painting.paintingNo}
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
              {showNav && (
                <PaintingDetailNavigation
                  variant="belowImage"
                  prev={navPrev}
                  next={navNext}
                  prevLabel={navPrevLabel}
                  nextLabel={navNextLabel}
                />
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <Typography level="overline" tone="tertiary" className="mb-2 block normal-case">
                {t('detail.paintingNumber', { number: `#${painting.paintingNo}` })}
              </Typography>
              {painting.paintingName && (
                <Typography level="h1" className="mb-8">
                  {painting.paintingName}
                </Typography>
              )}

              {!mainArtist && painting.artistName && (
                <div className="mb-8">
                  <Typography level="overline" tone="tertiary" className="mb-1 block normal-case">
                    {t('detail.artist')}
                  </Typography>
                  <Typography level="h2">{painting.artistName}</Typography>
                </div>
              )}

              {mainArtist && (
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
              )}
            </div>
          </div>

          {showNav && (
            <PaintingDetailNavigation
              variant="bar"
              prev={navPrev}
              next={navNext}
              prevLabel={navPrevLabel}
              nextLabel={navNextLabel}
            />
          )}
        </Container>
      </Section>

      {isLightboxOpen && (
        <PaintingLightbox
          src={images[activeImageIndex]?.src ?? images[0]?.src}
          alt={displayName}
          title={displayName}
          closeLabel={t('actions.close', { ns: 'common' })}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
