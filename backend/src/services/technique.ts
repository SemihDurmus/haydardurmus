import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

// Identical shape to the nationality service — repeated on purpose so the
// pattern becomes muscle memory and the real variations stand out later.

export interface ListArgs {
  skip: number;
  take: number;
  name?: string;
  search?: string;
}

export async function list({ skip, take, name, search }: ListArgs) {
  // ?name= exact / ?search= partial, both case-insensitive (exact wins if both).
  const where: Prisma.TechniqueWhereInput = {
    ...(search !== undefined && {
      name: { contains: search, mode: "insensitive" },
    }),
    ...(name !== undefined && { name: { equals: name, mode: "insensitive" } }),
  };
  const [items, total] = await Promise.all([
    prisma.technique.findMany({ where, skip, take, orderBy: { name: "asc" } }),
    prisma.technique.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.technique.findUnique({ where: { id } });
  if (!item) throw new NotFoundError(`Technique ${id} not found`);
  return item;
}

export function create(data: Prisma.TechniqueCreateInput) {
  return prisma.technique.create({ data });
}

export function update(id: number, data: Prisma.TechniqueUpdateInput) {
  return prisma.technique.update({ where: { id }, data });
}

export async function remove(id: number): Promise<void> {
  await prisma.technique.delete({ where: { id } });
}
