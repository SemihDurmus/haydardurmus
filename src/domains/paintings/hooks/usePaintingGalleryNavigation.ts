import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { buildRoute } from '@app/router/routes';
import { usePaintingFilters } from './usePaintingFilters';
import { usePaintings } from './usePaintings';

export interface PaintingNavTarget {
  pathname: string;
  search: string;
}

/**
 * Prev/next targets within the current gallery list (filters + sort from URL).
 * Requires the same query string to be kept when opening a detail page from the gallery.
 */
export function usePaintingGalleryNavigation(currentId: string) {
  const location = useLocation();
  const { filters, sort } = usePaintingFilters();
  const { data: paintings } = usePaintings(filters, sort);

  return useMemo(() => {
    const list = paintings ?? [];
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
  }, [paintings, currentId, location.search, filters, sort]);
}
