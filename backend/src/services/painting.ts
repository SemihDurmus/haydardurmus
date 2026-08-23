import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";
import { idSlug } from "../utils/slug";
import { paintingImageUrl, renamePaintingDir } from "../utils/paintingFiles";

// Single source of truth for the sortable keys — reused by the route's zod
// enum (routes/painting.ts) so the query-param contract and this service can
// never drift apart.
export const PAINTING_SORT_KEYS = [
  "year_desc",
  "year_asc",
  "no_asc",
  "no_desc",
  "name_asc",
  "name_desc",
  "size_desc",
  "size_asc",
] as const;
export type PaintingSort = (typeof PAINTING_SORT_KEYS)[number];

// The gallery's own artist. Public listings (the paintings page, featured
// works, curated collections — anywhere a caller doesn't ask for a specific
// artist) default to just his work. Other artists' paintings currently exist
// in the table for an upcoming "collection" section, not the main gallery,
// so they stay out of the public list unless a caller explicitly filters for
// them. Admin callers never get this default — the admin panel manages every
// artist's paintings.
const GALLERY_ARTIST_ID = 1; //Haydar Durmus

export interface ListArgs {
  skip: number;
  take: number;
  artistId?: number;
  /** Every painting EXCEPT this artist's — powers the collection gallery. */
  excludeArtistId?: number;
  ownerId?: number[];
  techniqueId?: number[];
  materialId?: number[];
  locationCityId?: number;
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  yearMin?: number;
  yearMax?: number;
  widthMin?: number;
  widthMax?: number;
  heightMin?: number;
  heightMax?: number;
  sort?: PaintingSort;
  /** Authenticated admin caller — includes the owner record in the response. */
  forAdmin?: boolean;
}

// year_desc/year_asc and size_desc/size_asc break ties by id so a page split
// is stable across requests instead of shuffling rows that tie on the sort key.
const SIMPLE_ORDER_BY: Partial<
  Record<PaintingSort, Prisma.PaintingOrderByWithRelationInput[]>
> = {
  year_desc: [{ year: "desc" }, { id: "desc" }],
  year_asc: [{ year: "asc" }, { id: "asc" }],
  no_asc: [{ paintingNo: "asc" }],
  no_desc: [{ paintingNo: "desc" }],
  name_asc: [{ paintingName: "asc" }],
  name_desc: [{ paintingName: "desc" }],
};

// "Size" isn't a column — it's width*height OR π*radius², across two mutually
// exclusive nullable columns — so Prisma's typed `orderBy` can't express it.
function paintingArea(p: {
  widthCm: Prisma.Decimal | null;
  heightCm: Prisma.Decimal | null;
  radiusCm: Prisma.Decimal | null;
}): number {
  if (p.radiusCm !== null) return Math.PI * Number(p.radiusCm) ** 2;
  if (p.widthCm !== null && p.heightCm !== null) {
    return Number(p.widthCm) * Number(p.heightCm);
  }
  return 0;
}

// The shared "card" graph — enough to render a painting in a list: artist
// (+nationality), technique, material, location city (+country), the *current*
// price only, and the *primary* image only. `satisfies` type-checks the shape
// against PaintingInclude without widening its inferred type.
//
// Owner is deliberately absent: it names a real person (plus their city and
// nationality) and nothing on the public site displays it, so shipping it to
// anonymous callers would leak who owns which artwork. The `ownerId` scalar
// still comes back — Prisma returns all scalars — but that's an opaque integer,
// and GET /api/owners is admin-only, so it resolves to nothing without a token.
const publicInclude = {
  artist: { include: { nationality: true } },
  technique: true,
  material: true,
  city: { include: { country: true } },
  prices: { where: { isCurrent: true }, include: { currency: true } },
  paintingImages: { where: { isPrimary: true }, take: 1 },
} satisfies Prisma.PaintingInclude;

// What an authenticated admin gets: the same graph plus the owner record. The
// admin painting form needs it to show and change who owns a painting.
const adminInclude = {
  ...publicInclude,
  owner: true,
} satisfies Prisma.PaintingInclude;

const detailInclude = (forAdmin: boolean) =>
  forAdmin ? adminInclude : publicInclude;

// Attach the decorative id-slug ("<id>-<painting-name>"). The id stays the
// authoritative key; the slug is a frontend/presentation concern only.
function withSlug<T extends { id: number; paintingName: string }>(p: T) {
  return { ...p, slug: idSlug(p.id, p.paintingName) };
}

export async function list({
  skip,
  take,
  artistId,
  excludeArtistId,
  ownerId,
  techniqueId,
  materialId,
  locationCityId,
  available,
  minPrice,
  maxPrice,
  search,
  yearMin,
  yearMax,
  widthMin,
  widthMax,
  heightMin,
  heightMax,
  sort,
  forAdmin = false,
}: ListArgs) {
  // An explicit artist scope (equals OR excludes) always wins over the
  // gallery-only default — only an unscoped public request gets defaulted.
  const hasExplicitArtistScope = artistId !== undefined || excludeArtistId !== undefined;
  const effectiveArtistId =
    artistId ?? (forAdmin || hasExplicitArtistScope ? undefined : GALLERY_ARTIST_ID);
  const where: Prisma.PaintingWhereInput = {
    ...(effectiveArtistId !== undefined && { artistId: effectiveArtistId }),
    ...(excludeArtistId !== undefined && { artistId: { not: excludeArtistId } }),
    ...(ownerId !== undefined && ownerId.length > 0 && { ownerId: { in: ownerId } }),
    ...(techniqueId !== undefined &&
      techniqueId.length > 0 && { techniqueId: { in: techniqueId } }),
    ...(materialId !== undefined &&
      materialId.length > 0 && { materialId: { in: materialId } }),
    // locationCityId is the painting's OWN city (public), not the owner's city.
    ...(locationCityId !== undefined && { locationCityId }),
    ...(available !== undefined && { isAvailable: available }),
    // A painting with no recorded year must never be silently dropped just
    // because a year filter is active elsewhere — Postgres treats `NULL >=
    // x` as unknown (never true), so on its own the range below would hide
    // it regardless of how wide the range is. OR it with "year IS NULL".
    ...((yearMin !== undefined || yearMax !== undefined) && {
      OR: [
        { year: null },
        {
          year: {
            ...(yearMin !== undefined && { gte: yearMin }),
            ...(yearMax !== undefined && { lte: yearMax }),
          },
        },
      ],
    }),
    ...((widthMin !== undefined || widthMax !== undefined) && {
      widthCm: {
        ...(widthMin !== undefined && { gte: widthMin }),
        ...(widthMax !== undefined && { lte: widthMax }),
      },
    }),
    ...((heightMin !== undefined || heightMax !== undefined) && {
      heightCm: {
        ...(heightMin !== undefined && { gte: heightMin }),
        ...(heightMax !== undefined && { lte: heightMax }),
      },
    }),
    // ?search= partial match on the painting's catalogue number
    // (case-insensitive). Not matched against paintingName: every painting
    // currently carries the "Untitled" sentinel, so a name search would
    // never narrow anything.
    ...(search !== undefined && {
      paintingNo: { contains: search, mode: "insensitive" },
    }),
    // Price range filters on the painting's CURRENT price (the listed price) via
    // a relation `some` — a painting matches if its is_current price is in range.
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      prices: {
        some: {
          isCurrent: true,
          amount: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        },
      },
    }),
  };

  const total = await prisma.painting.count({ where });

  if (sort === "size_desc" || sort === "size_asc") {
    const items = await listSortedBySize({ where, skip, take, sort, forAdmin });
    return { items: items.map(withSlug), total };
  }

  const items = await prisma.painting.findMany({
    where,
    skip,
    take,
    orderBy: SIMPLE_ORDER_BY[sort as PaintingSort] ?? [{ createdAt: "desc" }],
    include: detailInclude(forAdmin),
  });
  return { items: items.map(withSlug), total };
}

// "Size" spans two mutually exclusive nullable columns (width×height OR
// π×radius²), which Prisma's typed `orderBy` can't express as a single sort
// key. Rank in application code instead of hand-rolling raw SQL that would
// have to duplicate the `where` clause above (and risk drifting from it):
// fetch every matching row's id + dimensions (cheap — no joins), sort by
// area, take just this page's ids, then fetch the full include graph for
// those ids and restore the ranked order.
async function listSortedBySize({
  where,
  skip,
  take,
  sort,
  forAdmin,
}: {
  where: Prisma.PaintingWhereInput;
  skip: number;
  take: number;
  sort: Extract<PaintingSort, "size_desc" | "size_asc">;
  forAdmin: boolean;
}) {
  const dims = await prisma.painting.findMany({
    where,
    select: { id: true, widthCm: true, heightCm: true, radiusCm: true },
  });
  dims.sort((a, b) => {
    const diff = paintingArea(a) - paintingArea(b);
    return sort === "size_desc" ? -diff : diff;
  });
  const pageIds = dims.slice(skip, skip + take).map((d) => d.id);
  if (pageIds.length === 0) return [];

  const rows = await prisma.painting.findMany({
    where: { id: { in: pageIds } },
    include: detailInclude(forAdmin),
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return pageIds.map((id) => byId.get(id)).filter((r): r is (typeof rows)[number] => r !== undefined);
}

// Powers the public gallery's filter panel: the year range and the set of
// techniques/materials actually used by at least one painting, computed
// across the WHOLE table rather than whatever page the client last fetched.
export async function getFilterOptions() {
  const [yearRange, techniques, materials] = await Promise.all([
    prisma.painting.aggregate({ _min: { year: true }, _max: { year: true } }),
    prisma.technique.findMany({
      where: { paintings: { some: {} } },
      orderBy: { name: "asc" },
    }),
    prisma.material.findMany({
      where: { paintings: { some: {} } },
      orderBy: { name: "asc" },
    }),
  ]);
  return {
    yearMin: yearRange._min.year,
    yearMax: yearRange._max.year,
    techniques,
    materials,
  };
}

export async function get(id: number, forAdmin = false) {
  const item = await prisma.painting.findUnique({
    where: { id },
    include: {
      ...detailInclude(forAdmin),
      // The detail view returns the FULLER graph: all images and the complete
      // price history, overriding the trimmed versions from detailInclude.
      paintingImages: { orderBy: { isPrimary: "desc" } },
      prices: { include: { currency: true }, orderBy: { effectiveDate: "desc" } },
    },
  });
  if (!item) throw new NotFoundError(`Painting ${id} not found`);
  return withSlug(item);
}

export async function create(
  data: Prisma.PaintingCreateInput | Prisma.PaintingUncheckedCreateInput,
) {
  // create/update are reachable only through the write guard, i.e. by an
  // authenticated admin — so the owner record is always safe to return here.
  const created = await prisma.painting.create({
    data,
    include: adminInclude,
  });
  return withSlug(created);
}

export async function update(
  id: number,
  data: Prisma.PaintingUpdateInput | Prisma.PaintingUncheckedUpdateInput,
) {
  // A painting's images live in a folder named by its painting_no, so changing
  // the number has to move the folder and rewrite the stored URLs — otherwise
  // every image 404s. (The painting_image.painting_no column is handled for us
  // by a database trigger; file_path is not.)
  const before = await prisma.painting.findUnique({
    where: { id },
    select: { paintingNo: true },
  });
  if (!before) throw new NotFoundError(`Painting ${id} not found`);

  const nextNo = typeof data.paintingNo === "string" ? data.paintingNo : undefined;
  const renaming = nextNo !== undefined && nextNo !== before.paintingNo;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.painting.update({ where: { id }, data });

    if (renaming) {
      // Rebuild each URL from the canonical helper rather than string-replacing
      // the old number, which would also corrupt a filename containing it.
      const images = await tx.paintingImage.findMany({
        where: { paintingId: id },
        select: { id: true, filePath: true },
      });
      for (const image of images) {
        const filename = image.filePath.split("/").pop();
        if (!filename) continue;
        await tx.paintingImage.update({
          where: { id: image.id },
          data: { filePath: paintingImageUrl(nextNo, filename) },
        });
      }

      // Inside the transaction on purpose: if the directory can't be moved
      // (name collision, permissions), this throws and the rename is rolled
      // back, leaving the database and the disk agreeing with each other.
      // The residual risk is the reverse order — a commit failing after a
      // successful move — which would leave the files under the new name and
      // the rows under the old one.
      renamePaintingDir(before.paintingNo, nextNo);
    }

    return tx.painting.findUniqueOrThrow({ where: { id }, include: adminInclude });
  });

  return withSlug(updated);
}

export async function remove(id: number): Promise<void> {
  await prisma.painting.delete({ where: { id } });
}
