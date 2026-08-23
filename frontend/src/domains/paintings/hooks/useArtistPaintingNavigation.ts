import { useMemo } from 'react';
import { useCollectionArtists } from '@domains/artists/hooks/useArtists';
import type { Artist } from '@domains/artists/api/artistsService';

/**
 * Prev/next ARTIST (not painting) for a collection painting reached via the
 * Collection page's Artists tab — lets a visitor step through artists from
 * the painting detail page instead of going back to Collection each time.
 *
 * Uses the artist list's default order (by last name — see
 * artistsService.getCollectionArtists), matching what the Artists tab shows
 * before any search/sort is applied; that's local UI state on the Collection
 * page, not carried in the URL, so it isn't available here.
 */
export function useArtistPaintingNavigation(currentArtistId: number | undefined) {
  const { data: artists } = useCollectionArtists();

  return useMemo(() => {
    const index = artists && currentArtistId !== undefined
      ? artists.findIndex((a) => a.id === currentArtistId)
      : -1;

    const prevArtist: Artist | null = artists && index > 0 ? artists[index - 1] : null;
    const nextArtist: Artist | null =
      artists && index >= 0 && index < artists.length - 1 ? artists[index + 1] : null;

    return {
      prevArtist,
      nextArtist,
      showNavigation: index >= 0 && (artists?.length ?? 0) > 1,
    };
  }, [artists, currentArtistId]);
}
