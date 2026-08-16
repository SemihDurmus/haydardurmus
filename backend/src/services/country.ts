import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

export interface ListArgs {
  skip: number;
  take: number;
  name?: string;
  search?: string;
}

export async function list({ skip, take, name, search }: ListArgs) {
  // ?name= exact / ?search= partial, both case-insensitive (exact wins if both).
  const where: Prisma.CountryWhereInput = {
    // ?search= matches EITHER language, so a Turkish visitor searching
    // "Yağlıboya" finds the row whose English name is "Oil".
    ...(search !== undefined && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { nameTr: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(name !== undefined && { name: { equals: name, mode: "insensitive" } }),
  };
  const [items, total] = await Promise.all([
    prisma.country.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
      // Only the count of children on the list view — cheap, no row fetch.
      include: { _count: { select: { cities: true } } },
    }),
    prisma.country.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.country.findUnique({
    where: { id },
    // Full nested children on the single-country view, sorted by name.
    include: { cities: { orderBy: { name: "asc" } } },
  });
  if (!item) throw new NotFoundError(`Country ${id} not found`);
  return item;
}

export function create(data: Prisma.CountryCreateInput) {
  return prisma.country.create({ data });
}

export function update(id: number, data: Prisma.CountryUpdateInput) {
  return prisma.country.update({ where: { id }, data });
}

export async function remove(id: number): Promise<void> {
  await prisma.country.delete({ where: { id } });
}
