import type { PaintingSortKey } from '../types';

/**
 * Parse a sort key from URL params, falling back to default.
 */
export function parseSortFromParam(param: string | null, defaultSort: PaintingSortKey): PaintingSortKey {
  const validSorts: PaintingSortKey[] = [
    'year_desc', 'year_asc', 'no_asc', 'no_desc',
    'name_asc', 'name_desc', 'size_desc', 'size_asc',
  ];
  if (param && (validSorts as string[]).includes(param)) {
    return param as PaintingSortKey;
  }
  return defaultSort;
}
