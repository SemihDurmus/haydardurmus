import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

// Same template as nationality/technique, retargeted to the material table.

export interface ListArgs {
  skip: number;
  take: number;
  name?: string;
  search?: string;
}

export async function list({ skip, take, name, search }: ListArgs) {
  // ?name= exact / ?search= partial, both case-insensitive (exact wins if both).
  const where: Prisma.MaterialWhereInput = {
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
    prisma.material.findMany({ where, skip, take, orderBy: { name: "asc" } }),
    prisma.material.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.material.findUnique({ where: { id } });
  if (!item) throw new NotFoundError(`Material ${id} not found`);
  return item;
}

export function create(data: Prisma.MaterialCreateInput) {
  return prisma.material.create({ data });
}

export function update(id: number, data: Prisma.MaterialUpdateInput) {
  return prisma.material.update({ where: { id }, data });
}

export async function remove(id: number): Promise<void> {
  await prisma.material.delete({ where: { id } });
}
