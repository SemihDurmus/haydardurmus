/**
 * The gallery's own artist (Haydar Durmuş) — mirrors the backend's
 * GALLERY_ARTIST_ID (backend/src/services/painting.ts). His paintings carry
 * the site's usual catalogue info (technique, material, dimensions, year);
 * every other artist's paintings belong to the collection and are handled
 * differently — see the Collection page and PaintingDetail.
 */
export const GALLERY_ARTIST_ID = 1;

/** Whether a (raw, numeric) artist id is the gallery's own artist. */
export function isMainArtist(artistId: number): boolean {
  return artistId === GALLERY_ARTIST_ID;
}
