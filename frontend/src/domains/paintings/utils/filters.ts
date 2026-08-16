import type { SupportedLocale } from '@shared/types';
import { pickTranslated } from '@shared/hooks/useTranslatedText';
import type { Painting, PaintingFilters, PaintingLookupOption } from '../types';

/**
 * Apply all active filters to a paintings array.
 * Pure function — no side effects. Fully unit testable.
 * Adding a new filter: add a predicate block and update PaintingFilters type.
 */
export function applyFilters(paintings: Painting[], filters: PaintingFilters): Painting[] {
  return paintings.filter((p) => {
    // Full-text search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const nameMatch = p.paintingName?.toLowerCase().includes(q) ?? false;
      const noMatch = p.paintingNo.toLowerCase().includes(q);
      if (!nameMatch && !noMatch) return false;
    }

    // Year filter
    if (filters.years.length > 0) {
      if (p.year === null || !filters.years.includes(p.year)) return false;
    }

    // Technique filter
    if (filters.techniqueIds.length > 0) {
      if (!p.techniqueId || !filters.techniqueIds.includes(p.techniqueId)) return false;
    }

    // Material filter
    if (filters.materialIds.length > 0) {
      if (!p.materialId || !filters.materialIds.includes(p.materialId)) return false;
    }

    // Owner filter
    if (filters.ownerIds.length > 0) {
      if (!p.ownerId || !filters.ownerIds.includes(p.ownerId)) return false;
    }

    // Dimension range filters
    if (filters.widthMin !== null && (p.width === null || p.width < filters.widthMin)) return false;
    if (filters.widthMax !== null && (p.width === null || p.width > filters.widthMax)) return false;
    if (filters.heightMin !== null && (p.height === null || p.height < filters.heightMin))
      return false;
    if (filters.heightMax !== null && (p.height === null || p.height > filters.heightMax))
      return false;

    return true;
  });
}

/** Count how many filter dimensions are currently active. */
export function countActiveFilters(filters: PaintingFilters): number {
  let count = 0;
  if (filters.search.trim()) count++;
  if (filters.years.length) count++;
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

  const parseNumbers = (key: string): number[] => {
    return parseIds(key)
      .map(Number)
      .filter((n) => !isNaN(n));
  };

  const parseNumber = (key: string): number | null => {
    const val = params.get(key);
    if (!val) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  return {
    search: params.get('q') ?? '',
    years: parseNumbers('year'),
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
  if (filters.years.length) params.set('year', filters.years.join(','));
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
 * Extract unique years from a paintings array, sorted descending.
 */
/**
 * Build the filter options for a lookup out of the paintings themselves.
 *
 * The frontend holds no list of techniques or materials — the options are
 * whatever the loaded paintings actually use, labelled in the current locale
 * straight from the database. Adding a technique in the admin panel makes it
 * appear here as soon as a painting uses it; nothing to redeploy.
 *
 * Sorted with localeCompare under the active locale, so Turkish letters order
 * correctly (ç, ğ, ı, ö, ş, ü) instead of being pushed to the end.
 */
export function extractLookupOptions(
  paintings: Painting[],
  idKey: 'techniqueId' | 'materialId',
  labelKey: 'technique' | 'material',
  locale: SupportedLocale,
): PaintingLookupOption[] {
  const options = new Map<string, string>();
  for (const p of paintings) {
    const id = p[idKey];
    const label = pickTranslated(p[labelKey], locale);
    if (id && label && !options.has(id)) options.set(id, label);
  }
  return Array.from(options, ([id, label]) => ({ id, label })).sort((a, b) =>
    a.label.localeCompare(b.label, locale),
  );
}

export function extractYears(paintings: Painting[]): number[] {
  const years = new Set<number>();
  for (const p of paintings) {
    if (p.year !== null) years.add(p.year);
  }
  return Array.from(years).sort((a, b) => b - a);
}
