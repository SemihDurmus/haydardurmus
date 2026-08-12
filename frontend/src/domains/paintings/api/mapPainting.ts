import { API_ORIGIN } from '@shared/api/client';
import type { Painting } from '../types';
import { techniques, materials } from '../data/lookups';

/**
 * Translate a backend painting record into the frontend `Painting` model.
 *
 * The two sides disagree on shape, and this is the one place that reconciles it:
 *   - backend ids are numbers; the frontend uses strings (and short slug-like
 *     ids such as 'oil' for lookups) — see the mapping helpers below
 *   - backend dimensions are NUMERIC, serialized as JSON strings ("31.5")
 *   - untitled works carry a sentinel name the backend requires (NOT NULL);
 *     we map it back to `null` so the UI renders exactly as before
 */
const UNTITLED = 'Untitled';

interface NamedRef {
  id: number;
  name: string;
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
 * Recover the frontend's short lookup id from the backend's English name.
 * The frontend keeps a curated bilingual lookup table (lookups.ts); we match the
 * backend name to a label there so existing filters keep working. If there's no
 * curated entry, fall back to a slug of the name.
 */
function lookupId(
  items: ReadonlyArray<{ id: string; label: string }>,
  name: string | undefined,
): string | null {
  if (!name) return null;
  return items.find((i) => i.label === name)?.id ?? slugify(name);
}

const personSlug = (p?: PersonRef | null): string | null =>
  p ? slugify(`${p.firstName} ${p.lastName}`) : null;

export function mapPainting(dto: PaintingDto): Painting {
  return {
    id: String(dto.id),
    paintingNo: dto.paintingNo,
    paintingName: dto.paintingName === UNTITLED ? null : dto.paintingName,
    width: toNumber(dto.widthCm),
    height: toNumber(dto.heightCm),
    radius: toNumber(dto.radiusCm),
    artistId: personSlug(dto.artist) ?? String(dto.artistId),
    year: dto.year,
    techniqueId: lookupId(techniques, dto.technique?.name),
    materialId: lookupId(materials, dto.material?.name),
    locationCityId: dto.city ? slugify(dto.city.name) : null,
    ownerId: personSlug(dto.owner),
    slug: dto.slug,
    // The backend only knows available/not — map onto the richer status enum.
    availability: dto.isAvailable ? 'for_sale' : 'sold',
    // Backend-hosted images (primary first, as the API orders them).
    images: (dto.paintingImages ?? []).map((img) => ({
      src: `${API_ORIGIN}${img.filePath}`,
      alt: dto.paintingName === UNTITLED ? dto.paintingNo : dto.paintingName,
    })),
  };
}
