import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";
import { idSlug } from "../utils/slug";
import { paintingImageUrl, renamePaintingDir } from "../utils/paintingFiles";

export interface ListArgs {
  skip: number;
  take: number;
  artistId?: number;
  ownerId?: number;
  techniqueId?: number;
  materialId?: number;
  locationCityId?: number;
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  /** Authenticated admin caller — includes the owner record in the response. */
  forAdmin?: boolean;
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
  ownerId,
  techniqueId,
  materialId,
  locationCityId,
  available,
  minPrice,
  maxPrice,
  search,
  forAdmin = false,
}: ListArgs) {
  const where: Prisma.PaintingWhereInput = {
    ...(artistId !== undefined && { artistId }),
    ...(ownerId !== undefined && { ownerId }),
    ...(techniqueId !== undefined && { techniqueId }),
    ...(materialId !== undefined && { materialId }),
    // locationCityId is the painting's OWN city (public), not the owner's city.
    ...(locationCityId !== undefined && { locationCityId }),
    ...(available !== undefined && { isAvailable: available }),
    // ?search= partial match on the painting's name (case-insensitive).
    ...(search !== undefined && {
      paintingName: { contains: search, mode: "insensitive" },
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
  const [items, total] = await Promise.all([
    prisma.painting.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: detailInclude(forAdmin),
    }),
    prisma.painting.count({ where }),
  ]);
  return { items: items.map(withSlug), total };
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
