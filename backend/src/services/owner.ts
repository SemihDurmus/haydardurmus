import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

export interface ListArgs {
  skip: number;
  take: number;
  cityId?: number;
  nationalityId?: number;
  search?: string;
}

export async function list({
  skip,
  take,
  cityId,
  nationalityId,
  search,
}: ListArgs) {
  // Build the filter from whichever optional params were supplied. Conditional
  // spread: `...(false)` contributes nothing, `...({ cityId })` adds the key.
  const where: Prisma.OwnerWhereInput = {
    ...(cityId !== undefined && { cityId }),
    ...(nationalityId !== undefined && { nationalityId }),
    // ?search= matches either name (case-insensitive). Owners are internal-only,
    // so this is an admin convenience, not a public-site feature.
    ...(search !== undefined && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.owner.findMany({
      where,
      skip,
      take,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        city: { include: { country: true } }, // two levels deep
        nationality: true,
      },
    }),
    prisma.owner.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.owner.findUnique({
    where: { id },
    include: {
      city: { include: { country: true } },
      nationality: true,
      _count: { select: { paintings: true } },
    },
  });
  if (!item) throw new NotFoundError(`Owner ${id} not found`);
  return item;
}

export function create(
  data: Prisma.OwnerCreateInput | Prisma.OwnerUncheckedCreateInput,
) {
  return prisma.owner.create({
    data,
    include: {
      city: { include: { country: true } },
      nationality: true,
    },
  });
}

export function update(
  id: number,
  data: Prisma.OwnerUpdateInput | Prisma.OwnerUncheckedUpdateInput,
) {
  return prisma.owner.update({
    where: { id },
    data,
    include: {
      city: { include: { country: true } },
      nationality: true,
    },
  });
}

export async function remove(id: number): Promise<void> {
  await prisma.owner.delete({ where: { id } });
}
