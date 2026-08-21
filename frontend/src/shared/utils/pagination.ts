/** A page number, or a collapsed run of skipped pages. */
export type PageToken = number | 'ellipsis';

/**
 * Build the list of page numbers/ellipses to render for a pager.
 * Always includes page 1, the last page, and a window of one sibling on
 * either side of the current page. Gaps larger than one page collapse into
 * a single 'ellipsis' token instead of listing every skipped page.
 */
export function getPaginationRange(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 0) return [];

  // Small enough that the full range never needs collapsing: 1 + totalPages
  // (boundary + last) + the 3-wide sibling window around the current page.
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const range: PageToken[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    const prev = sorted[i - 1];
    if (prev !== undefined) {
      if (page - prev === 2) {
        range.push(prev + 1);
      } else if (page - prev > 2) {
        range.push('ellipsis');
      }
    }
    range.push(page);
  }

  return range;
}
