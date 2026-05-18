import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  parseFiltersFromParams,
  serializeFiltersToParams,
  countActiveFilters,
} from '../utils/filters';
import { parseSortFromParam } from '../utils/sorting';
import { EMPTY_FILTERS, DEFAULT_SORT, type PaintingFilters, type PaintingSortKey } from '../types';

/**
 * Manages painting filter and sort state via URL search params.
 * Filters are the URL — no separate React state needed.
 * All filtered views are automatically shareable and bookmarkable.
 */
export function usePaintingFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams]
  );

  const sort = useMemo(
    () => parseSortFromParam(searchParams.get('sort'), DEFAULT_SORT),
    [searchParams]
  );

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const setFilter = useCallback(
    <K extends keyof PaintingFilters>(key: K, value: PaintingFilters[K]) => {
      setSearchParams((prev) => {
        const next = parseFiltersFromParams(prev);
        const nextSort = parseSortFromParam(prev.get('sort'), DEFAULT_SORT);
        (next as PaintingFilters)[key] = value;
        const params = serializeFiltersToParams(next);
        if (nextSort !== DEFAULT_SORT) params.set('sort', nextSort);
        return params;
      });
    },
    [setSearchParams]
  );

  const setSort = useCallback(
    (nextSort: PaintingSortKey) => {
      setSearchParams((prev) => {
        const current = parseFiltersFromParams(prev);
        const params = serializeFiltersToParams(current);
        if (nextSort !== DEFAULT_SORT) params.set('sort', nextSort);
        return params;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const currentSort = parseSortFromParam(prev.get('sort'), DEFAULT_SORT);
      const params = new URLSearchParams();
      if (currentSort !== DEFAULT_SORT) params.set('sort', currentSort);
      return params;
    });
  }, [setSearchParams]);

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const toggleMultiFilter = useCallback(
    (key: 'years' | 'techniqueIds' | 'materialIds' | 'locationCityIds' | 'ownerIds', value: string | number) => {
      setSearchParams((prev) => {
        const current = parseFiltersFromParams(prev);
        const currentSort = parseSortFromParam(prev.get('sort'), DEFAULT_SORT);
        const arr = current[key] as (string | number)[];
        const idx = arr.indexOf(value);
        const next = { ...current, [key]: idx >= 0 ? arr.filter((v) => v !== value) : [...arr, value] };
        const params = serializeFiltersToParams(next as PaintingFilters);
        if (currentSort !== DEFAULT_SORT) params.set('sort', currentSort);
        return params;
      });
    },
    [setSearchParams]
  );

  return {
    filters,
    sort,
    activeFilterCount,
    setFilter,
    setSort,
    clearFilters,
    clearAll,
    toggleMultiFilter,
    isEmpty: activeFilterCount === 0 && sort === DEFAULT_SORT,
    EMPTY_FILTERS,
  };
}
