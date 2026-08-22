import type { SupportedLocale, TranslatedText } from '@shared/types';
import { pickTranslated } from '@shared/hooks/useTranslatedText';
import type { PaintingFilters, PaintingLookupOption } from '../types';

/** Count how many filter dimensions are currently active. */
export function countActiveFilters(filters: PaintingFilters): number {
  let count = 0;
  if (filters.search.trim()) count++;
  if (filters.yearMin !== null || filters.yearMax !== null) count++;
  if (filters.techniqueIds.length) count++;
  if (filters.materialIds.length) count++;
  if (filters.ownerIds.length) count++;
  if (filters.widthMin !== null || filters.widthMax !== null) count++;
  if (filters.heightMin !== null || filters.heightMax !== null) count++;
  return count;
}

/** Check if all filter dimensions are empty. */
export function isFiltersEmpty(filters: PaintingFilters): boolean {
  return countActiveFilters(filters) === 0;
}

/**
 * Parse URL search params into a typed PaintingFilters object.
 * Unknown or malformed params are safely ignored.
 */
export function parseFiltersFromParams(params: URLSearchParams): PaintingFilters {
  const parseIds = (key: string): string[] => {
    const val = params.get(key);
    if (!val) return [];
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parseNumber = (key: string): number | null => {
    const val = params.get(key);
    if (!val) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  return {
    search: params.get('q') ?? '',
    yearMin: parseNumber('y_min'),
    yearMax: parseNumber('y_max'),
    techniqueIds: parseIds('technique'),
    materialIds: parseIds('material'),
    ownerIds: parseIds('owner'),
    widthMin: parseNumber('w_min'),
    widthMax: parseNumber('w_max'),
    heightMin: parseNumber('h_min'),
    heightMax: parseNumber('h_max'),
  };
}

/**
 * Serialize a PaintingFilters object into URL search params.
 * Empty/null values are omitted to keep URLs clean.
 */
export function serializeFiltersToParams(filters: PaintingFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set('q', filters.search.trim());
  if (filters.yearMin !== null) params.set('y_min', String(filters.yearMin));
  if (filters.yearMax !== null) params.set('y_max', String(filters.yearMax));
  if (filters.techniqueIds.length) params.set('technique', filters.techniqueIds.join(','));
  if (filters.materialIds.length) params.set('material', filters.materialIds.join(','));
  if (filters.ownerIds.length) params.set('owner', filters.ownerIds.join(','));
  if (filters.widthMin !== null) params.set('w_min', String(filters.widthMin));
  if (filters.widthMax !== null) params.set('w_max', String(filters.widthMax));
  if (filters.heightMin !== null) params.set('h_min', String(filters.heightMin));
  if (filters.heightMax !== null) params.set('h_max', String(filters.heightMax));

  return params;
}

/**
 * Resolve a lookup's server-provided options (see PaintingFilterOptions) to
 * the active locale's label, sorted with localeCompare so Turkish letters
 * order correctly (ç, ğ, ı, ö, ş, ü) instead of being pushed to the end.
 *
 * The frontend holds no hardcoded list of techniques or materials — the
 * options come from the backend's /paintings/filter-options facet endpoint,
 * which reflects every painting in the database, not just a loaded page.
 */
export function resolveLookupOptions(
  options: { id: string; label: TranslatedText }[],
  locale: SupportedLocale,
): PaintingLookupOption[] {
  return options
    .map(({ id, label }) => ({ id, label: pickTranslated(label, locale) ?? '' }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}
