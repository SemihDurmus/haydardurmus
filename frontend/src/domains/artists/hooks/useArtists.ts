import { useQuery } from '@tanstack/react-query';
import { artistsService } from '../api/artistsService';

/** Artists shown on the public collection page (every artist but the gallery's own). */
export function useCollectionArtists() {
  return useQuery({
    queryKey: ['artists', 'collection'],
    queryFn: artistsService.getCollectionArtists,
    staleTime: 5 * 60 * 1000,
  });
}
