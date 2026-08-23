import { apiGet } from '@shared/api/client';
import { isMainArtist } from '../utils/isMainArtist';

export interface Artist {
  id: number;
  firstName: string;
  lastName: string;
}

interface ArtistListDto {
  data: Artist[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const PAGE_LIMIT = 100; // the backend's hard per-request cap

export const artistsService = {
  /**
   * All artists except the gallery's own, sorted by last name (the backend's
   * default order). The artist list can exceed one page, so this pages
   * through the full result instead of requesting a single capped batch.
   */
  async getCollectionArtists(): Promise<Artist[]> {
    const all: Artist[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await apiGet<ArtistListDto>(`/artists?page=${page}&limit=${PAGE_LIMIT}`);
      all.push(...res.data);
      totalPages = res.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);

    return all.filter((artist) => !isMainArtist(artist.id));
  },
};
