/**
 * Formatting utilities — pure functions, fully testable.
 */

/** Format painting dimensions as a readable string. */
export function formatDimensions(
  width: number | null,
  height: number | null,
  radius: number | null
): string {
  if (radius !== null) {
    return `⌀${radius} cm`;
  }
  if (width !== null && height !== null) {
    return `${width} × ${height} cm`;
  }
  if (width !== null) {
    return `${width} cm (w)`;
  }
  if (height !== null) {
    return `${height} cm (h)`;
  }
  return '—';
}

/** Calculate painting area in cm² for sorting by size. */
export function getPaintingArea(
  width: number | null,
  height: number | null,
  radius: number | null
): number {
  if (radius !== null) {
    return Math.PI * radius * radius;
  }
  if (width !== null && height !== null) {
    return width * height;
  }
  return 0;
}

/** Format a year or return a fallback string. */
export function formatYear(year: number | null, fallback = 'Unknown'): string {
  return year !== null ? String(year) : fallback;
}

/** Truncate a string to a maximum length with ellipsis. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/** Safely get the display name of a painting. */
export function getPaintingDisplayName(
  paintingName: string | null,
  paintingNo: string,
  fallback = 'Untitled'
): string {
  return paintingName ?? `${fallback} (${paintingNo})`;
}
