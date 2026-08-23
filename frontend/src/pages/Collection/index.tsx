import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { PageTitle } from '@shared/ui/PageTitle';
import { SectionTitle } from '@shared/ui/SectionTitle';
import { cn } from '@shared/utils/cn';
import { useCollectionArtists } from '@domains/artists/hooks/useArtists';
import { paintingsService } from '@domains/paintings/api/paintingsService';
import { useCollectionPaintings } from '@domains/paintings/hooks/usePaintings';
import { PaintingImageGrid } from '@domains/paintings/components/PaintingImageGrid';
import { buildRoute } from '@app/router/routes';

type CollectionTab = 'artists' | 'gallery';

const TABS: { value: CollectionTab; labelKey: string }[] = [
  { value: 'artists', labelKey: 'tabs.artists' },
  { value: 'gallery', labelKey: 'tabs.gallery' },
];

// One button per artist represented in the collection (everyone but the
// gallery's own artist, see useCollectionArtists). Clicking one jumps to
// that artist's first painting.
function ArtistsTab() {
  const { data: artists } = useCollectionArtists();
  const navigate = useNavigate();
  const [pendingArtistId, setPendingArtistId] = useState<number | null>(null);

  const handleArtistClick = async (artistId: number) => {
    if (pendingArtistId !== null) return;
    setPendingArtistId(artistId);
    try {
      const painting = await paintingsService.getFirstByArtist(artistId);
      if (painting) navigate(`${buildRoute.paintingDetail(painting.id)}?tab=artists`);
    } finally {
      setPendingArtistId(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {(artists ?? []).map((artist) => (
        <button
          key={artist.id}
          type="button"
          disabled={pendingArtistId !== null}
          onClick={() => handleArtistClick(artist.id)}
          className={cn(
            'bg-text-title px-4 py-3 text-center',
            'font-heading text-body-sm text-text-inverted',
            'transition-colors duration-150 hover:bg-[#D9A61C]',
            'disabled:cursor-wait disabled:opacity-70'
          )}
        >
          {artist.firstName} {artist.lastName}
        </button>
      ))}
    </div>
  );
}

// Same presentation as the home page's Featured Paintings — every painting
// not by the gallery's own artist (see useCollectionPaintings). Unlike the
// home version, hovering shows the artist's name (not the catalogue number,
// which means nothing to a visitor here) and clicking opens the painting;
// the link carries `?tab=gallery` so the painting page's back button returns
// to this tab instead of defaulting to Artists.
function GalleryTab() {
  const { data: paintings } = useCollectionPaintings();
  return (
    <PaintingImageGrid
      paintings={paintings ?? []}
      overlayLabel={(painting) => painting.artistName ?? ''}
      linkTo={(painting) => `${buildRoute.paintingDetail(painting.id)}?tab=gallery`}
    />
  );
}

export default function CollectionPage() {
  const { t } = useTranslation('collections');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: CollectionTab = searchParams.get('tab') === 'gallery' ? 'gallery' : 'artists';

  const setActiveTab = (tab: CollectionTab) => {
    setSearchParams(tab === 'artists' ? {} : { tab });
  };

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
          {/* Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-1 border-b border-border pb-0">
            {TABS.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={cn(
                  'border-b-2 px-4 pb-3 pt-1 text-center font-heading text-body-sm transition-colors',
                  activeTab === value
                    ? 'border-primary-900 text-text-primary'
                    : 'border-transparent text-text-tertiary hover:text-text-secondary'
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          {activeTab === 'artists' && <ArtistsTab />}
          {activeTab === 'gallery' && <GalleryTab />}
        </Container>
      </Section>
    </>
  );
}
