import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { paintingsService } from '../api/paintingsService';
import type { PaintingFilters, PaintingSortKey } from '../types';

export const paintingKeys = {
  all: ['paintings'] as const,
  lists: () => [...paintingKeys.all, 'list'] as const,
  list: (filters: PaintingFilters, sort: PaintingSortKey, page: number, limit: number) =>
    [...paintingKeys.lists(), { filters, sort, page, limit }] as const,
  details: () => [...paintingKeys.all, 'detail'] as const,
  detail: (id: string) => [...paintingKeys.details(), id] as const,
  featured: (limit?: number) => [...paintingKeys.all, 'featured', limit] as const,
  filterOptions: () => [...paintingKeys.all, 'filter-options'] as const,
  collection: () => [...paintingKeys.all, 'collection'] as const,
};

/**
 * Fetch every painting (unfiltered). Used where the full set is needed
 * regardless of the active filters — the total count and the year filter chips.
 */
export function useAllPaintings() {
  return useQuery({
    queryKey: [...paintingKeys.all, 'all'] as const,
    queryFn: () => paintingsService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch one page of paintings, filtered and sorted server-side.
 * `keepPreviousData` keeps the current page's results on screen while the
 * next page loads, instead of flashing back to the loading skeleton.
 */
export function usePaintings(
  filters: PaintingFilters,
  sort: PaintingSortKey,
  page: number,
  limit: number,
) {
  return useQuery({
    queryKey: paintingKeys.list(filters, sort, page, limit),
    queryFn: () => paintingsService.getPage(filters, sort, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch the gallery's filter facets (year range, techniques, materials in
 * use) — computed across every painting, unlike `useAllPaintings`, which is
 * capped at one page.
 */
export function usePaintingFilterOptions() {
  return useQuery({
    queryKey: paintingKeys.filterOptions(),
    queryFn: () => paintingsService.getFilterOptions(),
    staleTime: 5 * 60 * 1000,
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

/** Every painting not by the gallery's own artist — the Collection page's Gallery tab. */
export function useCollectionPaintings() {
  return useQuery({
    queryKey: paintingKeys.collection(),
    queryFn: () => paintingsService.getCollectionPaintings(),
    staleTime: 5 * 60 * 1000,
  });
}
