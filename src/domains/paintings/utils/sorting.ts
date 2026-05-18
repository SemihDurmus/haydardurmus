import type { Painting, PaintingSortKey } from '../types';
import { getPaintingArea } from '@shared/utils';

/**
 * Sort a paintings array by the given sort key.
 * Pure function — returns a new array, does not mutate input.
 */
export function applySorting(paintings: Painting[], sort: PaintingSortKey): Painting[] {
  const sorted = [...paintings];

  switch (sort) {
    case 'year_desc':
      return sorted.sort((a, b) => {
        if (a.year === null && b.year === null) return 0;
        if (a.year === null) return 1;
        if (b.year === null) return -1;
        return b.year - a.year;
      });

    case 'year_asc':
      return sorted.sort((a, b) => {
        if (a.year === null && b.year === null) return 0;
        if (a.year === null) return 1;
        if (b.year === null) return -1;
        return a.year - b.year;
      });

    case 'no_asc':
      return sorted.sort((a, b) => a.paintingNo.localeCompare(b.paintingNo, undefined, { numeric: true }));

    case 'no_desc':
      return sorted.sort((a, b) => b.paintingNo.localeCompare(a.paintingNo, undefined, { numeric: true }));

    case 'name_asc':
      return sorted.sort((a, b) => {
        const nameA = a.paintingName ?? '';
        const nameB = b.paintingName ?? '';
        return nameA.localeCompare(nameB);
      });

    case 'name_desc':
      return sorted.sort((a, b) => {
        const nameA = a.paintingName ?? '';
        const nameB = b.paintingName ?? '';
        return nameB.localeCompare(nameA);
      });

    case 'size_desc':
      return sorted.sort(
        (a, b) =>
          getPaintingArea(b.width, b.height, b.radius) -
          getPaintingArea(a.width, a.height, a.radius)
      );

    case 'size_asc':
      return sorted.sort(
        (a, b) =>
          getPaintingArea(a.width, a.height, a.radius) -
          getPaintingArea(b.width, b.height, b.radius)
      );

    default:
      return sorted;
  }
}

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
