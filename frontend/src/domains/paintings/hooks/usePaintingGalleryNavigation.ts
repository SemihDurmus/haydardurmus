import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { buildRoute } from '@app/router/routes';
import { usePaintingFilters } from './usePaintingFilters';
import { usePaintings } from './usePaintings';

export interface PaintingNavTarget {
  pathname: string;
  search: string;
}

// Prev/next only make sense within a single fetched window, so this pulls
// the same "first 100" batch as paintingsService.getAll() — plenty for the
// gallery's current size, and consistent with how the rest of the app treats
// "all of it" as one bounded page rather than paging through every result.
const NAV_WINDOW_LIMIT = 100;

/**
 * Prev/next targets within the current gallery list (filters + sort from URL).
 * Requires the same query string to be kept when opening a detail page from the gallery.
 */

export function usePaintingGalleryNavigation(currentId: string) {
  const location = useLocation();
  const { filters, sort } = usePaintingFilters();
  const { data } = usePaintings(filters, sort, 1, NAV_WINDOW_LIMIT);

  return useMemo(() => {
    const list = data?.items ?? [];
    const index = list.findIndex((p) => p.id === currentId);
    const search = location.search;

    const toDetail = (id: string): PaintingNavTarget => ({
      pathname: buildRoute.paintingDetail(id),
      search,
    });

    const prev = index > 0 ? { id: list[index - 1].id, to: toDetail(list[index - 1].id) } : null;
    const next =
      index >= 0 && index < list.length - 1
        ? { id: list[index + 1].id, to: toDetail(list[index + 1].id) }
        : null;

    return {
      prev,
      next,
      position: index >= 0 ? index + 1 : null,
      total: list.length,
      showNavigation: index >= 0 && list.length > 1,
    };
  }, [data, currentId, location.search]);
}
