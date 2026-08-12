import { apiGet, ApiError } from '@shared/api/client';
import { mapPainting, type PaintingDto, type PaintingListDto } from './mapPainting';
import type { Painting } from '../types';

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

export const paintingsService = {
  /** Fetch all paintings. */
  async getAll(): Promise<Painting[]> {
    const res = await apiGet<PaintingListDto>(`/paintings?limit=${ALL_LIMIT}`);
    return res.data.map(mapPainting);
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
   * Fetch featured paintings for the home page. The backend has no "featured"
   * flag, so we simply take the first `limit` paintings it returns.
   */
  async getFeatured(limit = 6): Promise<Painting[]> {
    const all = await this.getAll();
    return all.slice(0, limit);
  },
};
