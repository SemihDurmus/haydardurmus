import type { TranslatedText } from '@shared/types';
import type { Painting, PaintingFilterOptions } from '../types';

// TEMPORARY: images are served from ImageKit for now instead of the backend's
// own /images/* storage, one file per painting named after its paintingNo
// (e.g. https://ik.imagekit.io/haydardurmus/2183.jpg). Revert to
// dto.paintingImages + API_ORIGIN (see git history) once real uploads move
// back to the backend.
const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/haydardurmus';

/**
 * Translate a backend painting record into the frontend `Painting` model.
 *
 * The two sides disagree on shape, and this is the one place that reconciles it:
 *   - backend ids are numbers; the frontend uses strings (and short slug-like
 *     ids such as 'oil' for lookups) — see the mapping helpers below
 *   - backend dimensions are NUMERIC, serialized as JSON strings ("31.5")
 *   - untitled works carry a sentinel name the backend requires (NOT NULL);
 *     we map it back to `null` so the UI renders exactly as before
 *
 * Names and their Turkish come from the API and are passed straight through.
 * This file used to translate them against a curated table checked into the
 * frontend, which meant a technique added through the admin panel could never
 * be shown in Turkish. That table is gone.
 */
// Sentinel values the backend stores for a nameless work (paintingName is
// NOT NULL) — 'Untitled' from the seed data, 'isimsiz' (Turkish) used in
// production. Either maps back to null so the UI shows no name at all.
const UNTITLED_NAMES = new Set(['untitled', 'isimsiz']);
const isUntitled = (name: string): boolean => UNTITLED_NAMES.has(name.trim().toLowerCase());

/** A lookup row as the API returns it: English name plus its Turkish. */
interface NamedRef {
  id: number;
  name: string;
  nameTr: string;
}
interface PersonRef {
  id: number;
  firstName: string;
  lastName: string;
}

/** The relevant subset of a backend painting JSON object. */
export interface PaintingDto {
  id: number;
  slug?: string;
  paintingNo: string;
  paintingName: string;
  widthCm: string | null;
  heightCm: string | null;
  radiusCm: string | null;
  year: number | null;
  isAvailable: boolean;
  artistId: number;
  artist?: PersonRef | null;
  technique?: NamedRef | null;
  material?: NamedRef | null;
  city?: NamedRef | null;
  owner?: PersonRef | null;
  paintingImages?: { id: number; filePath: string; isPrimary: boolean }[];
}

/** The backend's paginated list envelope. */
export interface PaintingListDto {
  data: PaintingDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** The backend's filter facets response — see GET /paintings/filter-options. */
export interface PaintingFilterOptionsDto {
  yearMin: number | null;
  yearMax: number | null;
  techniques: NamedRef[];
  materials: NamedRef[];
}

const toNumber = (v: string | null): number | null => (v == null ? null : Number(v));

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Filter id for a lookup — the backend's real numeric id, as a string. Used
 * for both display keying and for the ?technique=/?material=/?owner= query
 * params the backend's server-side filtering expects.
 */
const lookupId = (ref?: { id: number } | null): string | null =>
  ref ? String(ref.id) : null;

/** Both languages of a lookup's name, for display. */
const lookupLabel = (ref?: NamedRef | null): TranslatedText | null =>
  ref ? { en: ref.name, tr: ref.nameTr } : null;

const personSlug = (p?: PersonRef | null): string | null =>
  p ? slugify(`${p.firstName} ${p.lastName}`) : null;

/** The backend's real numeric id, as a string — see `lookupId` above. */
const personId = (p?: PersonRef | null): string | null => (p ? String(p.id) : null);

const personName = (p?: PersonRef | null): string | null =>
  p ? `${p.firstName} ${p.lastName}` : null;

export function mapFilterOptions(dto: PaintingFilterOptionsDto): PaintingFilterOptions {
  const toOptions = (refs: NamedRef[]) =>
    refs.map((ref) => ({ id: String(ref.id), label: lookupLabel(ref)! }));
  return {
    yearMin: dto.yearMin,
    yearMax: dto.yearMax,
    techniques: toOptions(dto.techniques),
    materials: toOptions(dto.materials),
  };
}

export function mapPainting(dto: PaintingDto): Painting {
  return {
    id: String(dto.id),
    paintingNo: dto.paintingNo,
    paintingName: isUntitled(dto.paintingName) ? null : dto.paintingName,
    width: toNumber(dto.widthCm),
    height: toNumber(dto.heightCm),
    radius: toNumber(dto.radiusCm),
    artistId: personSlug(dto.artist) ?? String(dto.artistId),
    artistNumericId: dto.artistId,
    artistName: personName(dto.artist),
    year: dto.year,
    techniqueId: lookupId(dto.technique),
    materialId: lookupId(dto.material),
    locationCityId: lookupId(dto.city),
    ownerId: personId(dto.owner),
    technique: lookupLabel(dto.technique),
    material: lookupLabel(dto.material),
    locationCity: lookupLabel(dto.city),
    owner: personName(dto.owner),
    slug: dto.slug,
    // The backend only knows available/not — map onto the richer status enum.
    availability: dto.isAvailable ? 'for_sale' : 'sold',
    // TEMPORARY: ImageKit URL derived from paintingNo — see IMAGEKIT_BASE_URL above.
    images: [
      {
        src: `${IMAGEKIT_BASE_URL}/${dto.paintingNo}.jpg`,
        alt: isUntitled(dto.paintingName) ? dto.paintingNo : dto.paintingName,
      },
    ],
  };
}
