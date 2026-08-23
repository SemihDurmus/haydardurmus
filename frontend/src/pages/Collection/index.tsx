import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { PageTitle } from '@shared/ui/PageTitle';
import { SectionTitle } from '@shared/ui/SectionTitle';
import { cn } from '@shared/utils/cn';
import { useCollectionArtists } from '@domains/artists/hooks/useArtists';
import { paintingsService } from '@domains/paintings/api/paintingsService';
import { buildRoute } from '@app/router/routes';

export default function CollectionPage() {
  const { t } = useTranslation('collections');
  const { data: artists } = useCollectionArtists();
  const navigate = useNavigate();
  const [pendingArtistId, setPendingArtistId] = useState<number | null>(null);

  const handleArtistClick = async (artistId: number) => {
    if (pendingArtistId !== null) return;
    setPendingArtistId(artistId);
    try {
      const painting = await paintingsService.getFirstByArtist(artistId);
      if (painting) navigate(buildRoute.paintingDetail(painting.id));
    } finally {
      setPendingArtistId(null);
    }
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
      {/* Content — one button per artist represented in the collection
          (everyone but the gallery's own artist, see useCollectionArtists).
          Clicking one jumps to that artist's first painting. */}
      <Section spacing="lg" background="default" className="pt-8">
        <Container width="wide">
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
        </Container>
      </Section>
    </>
  );
}
