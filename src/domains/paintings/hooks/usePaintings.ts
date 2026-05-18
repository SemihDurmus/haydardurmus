import { useQuery } from '@tanstack/react-query';
import { paintingsService } from '../api/paintingsService';
import { applyFilters, applySorting } from '../utils';
import type { PaintingFilters, PaintingSortKey } from '../types';

export const paintingKeys = {
  all: ['paintings'] as const,
  lists: () => [...paintingKeys.all, 'list'] as const,
  list: (filters: PaintingFilters, sort: PaintingSortKey) =>
    [...paintingKeys.lists(), { filters, sort }] as const,
  details: () => [...paintingKeys.all, 'detail'] as const,
  detail: (id: string) => [...paintingKeys.details(), id] as const,
  featured: (limit?: number) => [...paintingKeys.all, 'featured', limit] as const,
};

/**
 * Fetch all paintings and apply client-side filters + sorting.
 * When API supports server-side filtering, move filter params into the service call.
 */
export function usePaintings(filters: PaintingFilters, sort: PaintingSortKey) {
  return useQuery({
    queryKey: paintingKeys.list(filters, sort),
    queryFn: async () => {
      const all = await paintingsService.getAll();
      const filtered = applyFilters(all, filters);
      return applySorting(filtered, sort);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/** Fetch a single painting by ID. */
export function usePainting(id: string) {
  return useQuery({
    queryKey: paintingKeys.detail(id),
    queryFn: () => paintingsService.getById(id),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(id),
  });
}

/** Fetch featured paintings for the home page. */
export function useFeaturedPaintings(limit = 6) {
  return useQuery({
    queryKey: paintingKeys.featured(limit),
    queryFn: () => paintingsService.getFeatured(limit),
    staleTime: 10 * 60 * 1000,
  });
}
