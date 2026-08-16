import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

export interface ListArgs {
  skip: number;
  take: number;
  countryId?: number;
  name?: string;
  search?: string;
}

export async function list({ skip, take, countryId, name, search }: ListArgs) {
  // Conditional filters: countryId, plus name lookup (?name= exact / ?search=
  // partial, case-insensitive). NB city names are unique only *within* a country,
  // so a bare name lookup can return several rows — pair with countryId to narrow.
  const where: Prisma.CityWhereInput = {
    ...(countryId !== undefined && { countryId }),
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
    prisma.city.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
      include: { country: true },
    }),
    prisma.city.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.city.findUnique({
    where: { id },
    include: { country: true },
  });
  if (!item) throw new NotFoundError(`City ${id} not found`);
  return item;
}

// Unchecked*Input is the variant that accepts a scalar `countryId` FK directly,
// instead of the relation form `country: { connect: { id } }`.
export function create(
  data: Prisma.CityCreateInput | Prisma.CityUncheckedCreateInput,
) {
  return prisma.city.create({ data, include: { country: true } });
}

export function update(
  id: number,
  data: Prisma.CityUpdateInput | Prisma.CityUncheckedUpdateInput,
) {
  return prisma.city.update({
    where: { id },
    data,
    include: { country: true },
  });
}

export async function remove(id: number): Promise<void> {
  await prisma.city.delete({ where: { id } });
}
