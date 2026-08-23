import { apiGet, ApiError } from '@shared/api/client';
import {
  mapPainting,
  mapFilterOptions,
  type PaintingDto,
  type PaintingListDto,
  type PaintingFilterOptionsDto,
} from './mapPainting';
import type { Painting, PaintingFilterOptions, PaintingFilters, PaintingSortKey } from '../types';
import { GALLERY_ARTIST_ID } from '@domains/artists/utils/isMainArtist';
import { paintingHasImage } from '../utils/probePaintingImage';

/**
 * Paintings service — all data fetching for paintings goes through here.
 *
 * Fetches from the backend REST API (see shared/api/client.ts) and maps each
 * record into the frontend `Painting` model. Swapping the data source meant
 * changing only this file: the hooks and components are untouched.
 */

// The backend caps page size at 100; the gallery is far smaller, so one page is
// enough. Filtering and sorting still happen client-side in the hooks.
const ALL_LIMIT = 100;

export interface PaintingPage {
  items: Painting[];
  pagination: PaintingListDto['pagination'];
}

export const paintingsService = {
  /** Fetch all paintings. */
  async getAll(): Promise<Painting[]> {
    const res = await apiGet<PaintingListDto>(`/paintings?limit=${ALL_LIMIT}`);
    return res.data.map(mapPainting);
  },

  /**
   * Fetch one page of paintings, filtered and sorted server-side. Used by the
   * public gallery — filtering, sorting, and pagination all happen in the
   * backend's query now, so this never over-fetches like `getAll()` does.
   */
  async getPage(
    filters: PaintingFilters,
    sort: PaintingSortKey,
    page: number,
    limit: number,
  ): Promise<PaintingPage> {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.yearMin !== null) params.set('yearMin', String(filters.yearMin));
    if (filters.yearMax !== null) params.set('yearMax', String(filters.yearMax));
    if (filters.techniqueIds.length) params.set('techniqueId', filters.techniqueIds.join(','));
    if (filters.materialIds.length) params.set('materialId', filters.materialIds.join(','));
    if (filters.ownerIds.length) params.set('ownerId', filters.ownerIds.join(','));
    if (filters.widthMin !== null) params.set('widthMin', String(filters.widthMin));
    if (filters.widthMax !== null) params.set('widthMax', String(filters.widthMax));
    if (filters.heightMin !== null) params.set('heightMin', String(filters.heightMin));
    if (filters.heightMax !== null) params.set('heightMax', String(filters.heightMax));
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const res = await apiGet<PaintingListDto>(`/paintings?${params.toString()}`);
    return { items: res.data.map(mapPainting), pagination: res.pagination };
  },

  /**
   * Fetch the gallery's filter facets — year range plus techniques/materials
   * in use — computed server-side across every painting, not just one page.
   */
  async getFilterOptions(): Promise<PaintingFilterOptions> {
    const dto = await apiGet<PaintingFilterOptionsDto>('/paintings/filter-options');
    return mapFilterOptions(dto);
  },

  /**
   * Fetch the first painting (by catalogue number) for a given artist —
   * powers the Collection page, where clicking an artist jumps straight to
   * one of their paintings. Returns null if the artist has none.
   */
  async getFirstByArtist(artistId: number): Promise<Painting | null> {
    const params = new URLSearchParams({
      artistId: String(artistId),
      sort: 'no_asc',
      page: '1',
      limit: '1',
    });
    const res = await apiGet<PaintingListDto>(`/paintings?${params.toString()}`);
    return res.data[0] ? mapPainting(res.data[0]) : null;
  },

  /** Fetch a single painting by id. Returns null if it doesn't exist. */
  async getById(id: string): Promise<Painting | null> {
    try {
      const dto = await apiGet<PaintingDto>(`/paintings/${id}`);
      return mapPainting(dto);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  /**
   * Fetch `limit` random paintings for the home page's Selected Works — a
   * different set on every call, and only ones whose photo actually loads
   * (some paintings have none; showing those looked broken, see
   * PaintingImageFrame's placeholder for where the rest still get one).
   *
   * The backend has no "featured" flag, random sort, or "has an image"
   * filter (image existence isn't even tracked in a queryable way — see
   * mapPainting's ImageKit URL guess), so this fetches page-sized random
   * batches — overfetching a bit to absorb the odd missing image — and
   * probes each candidate's photo client-side, trying additional random
   * batches until enough succeed or a round cap is hit.
   */
  async getFeatured(limit = 12): Promise<Painting[]> {
    const BATCH_SIZE = Math.min(ALL_LIMIT, limit * 2);
    const MAX_ROUNDS = 4;

    const found: Painting[] = [];
    const seenIds = new Set<string>();

    const consider = async (dtos: PaintingDto[]) => {
      await Promise.all(
        dtos.map(async (dto) => {
          const painting = mapPainting(dto);
          if (seenIds.has(painting.id) || found.length >= limit) return;
          seenIds.add(painting.id);
          if (await paintingHasImage(painting.images?.[0]?.src)) found.push(painting);
        }),
      );
    };

    // A cheap page-1 request just to learn the total. Its data is also kept
    // as a last-resort fallback pool below — real candidates always come
    // from a genuinely random page first, so this alone never determines
    // what shows (that would just be "the first N" again).
    const firstPage = await apiGet<PaintingListDto>(`/paintings?limit=${BATCH_SIZE}&page=1`);
    const totalPages = Math.ceil(firstPage.pagination.total / BATCH_SIZE);

    for (let round = 0; round < MAX_ROUNDS && found.length < limit; round++) {
      const page = totalPages > 1 ? 1 + Math.floor(Math.random() * (totalPages - 1)) : 1;
      const dtos =
        page === 1
          ? firstPage.data
          : (await apiGet<PaintingListDto>(`/paintings?limit=${BATCH_SIZE}&page=${page}`)).data;
      await consider(dtos);
    }

    // Pathological case (a random run of pages with unusually many missing
    // images) — fall back to page 1's own candidates rather than come up short.
    if (found.length < limit) await consider(firstPage.data);

    return found.slice(0, limit);
  },

  /**
   * Every painting NOT by the gallery's own artist — the Collection page's
   * Gallery tab. Pages through the full result since it can exceed the
   * backend's one-page cap.
   */
  async getCollectionPaintings(): Promise<Painting[]> {
    const all: Painting[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const params = new URLSearchParams({
        excludeArtistId: String(GALLERY_ARTIST_ID),
        page: String(page),
        limit: String(ALL_LIMIT),
      });
      const res = await apiGet<PaintingListDto>(`/paintings?${params.toString()}`);
      all.push(...res.data.map(mapPainting));
      totalPages = res.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);

    return all;
  },
};
