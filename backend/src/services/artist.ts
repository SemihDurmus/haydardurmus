import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";
import { idSlug } from "../utils/slug";

export interface ListArgs {
  skip: number;
  take: number;
  nationalityId?: number;
  search?: string;
}

// Attach the decorative id-slug ("<id>-<first>-<last>") to an artist row. The id
// stays the authoritative key; the slug is a frontend/presentation concern only.
function withSlug<T extends { id: number; firstName: string; lastName: string }>(
  a: T,
) {
  return { ...a, slug: idSlug(a.id, `${a.firstName} ${a.lastName}`) };
}

export async function list({ skip, take, nationalityId, search }: ListArgs) {
  const where: Prisma.ArtistWhereInput = {
    ...(nationalityId !== undefined && { nationalityId }),
    // ?search= matches either given or family name (case-insensitive contains),
    // so the frontend can resolve a typed name to artist ids.
    ...(search !== undefined && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      skip,
      take,
      // Sort by surname, then given name as the tie-break.
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { nationality: true },
    }),
    prisma.artist.count({ where }),
  ]);
  return { items: items.map(withSlug), total };
}

export async function get(id: number) {
  const item = await prisma.artist.findUnique({
    where: { id },
    // _count.paintings works even though the painting API isn't built yet —
    // the relation exists in the introspected schema.
    include: { nationality: true, _count: { select: { paintings: true } } },
  });
  if (!item) throw new NotFoundError(`Artist ${id} not found`);
  return withSlug(item);
}

export async function create(
  data: Prisma.ArtistCreateInput | Prisma.ArtistUncheckedCreateInput,
) {
  const created = await prisma.artist.create({
    data,
    include: { nationality: true },
  });
  return withSlug(created);
}

export async function update(
  id: number,
  data: Prisma.ArtistUpdateInput | Prisma.ArtistUncheckedUpdateInput,
) {
  const updated = await prisma.artist.update({
    where: { id },
    data,
    include: { nationality: true },
  });
  return withSlug(updated);
}

export async function remove(id: number): Promise<void> {
  await prisma.artist.delete({ where: { id } });
}
