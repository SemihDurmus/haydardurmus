import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

// Same CRUD template, but the currency table has an extra `symbol` column.
// The service code doesn't change shape at all — Prisma's generated
// CurrencyCreateInput/UpdateInput already include `symbol`, so the only place
// `symbol` is mentioned explicitly is the zod schema in the route.

export interface ListArgs {
  skip: number;
  take: number;
  name?: string;
  search?: string;
}

export async function list({ skip, take, name, search }: ListArgs) {
  // ?name= exact / ?search= partial, both case-insensitive (exact wins if both).
  const where: Prisma.CurrencyWhereInput = {
    ...(search !== undefined && {
      name: { contains: search, mode: "insensitive" },
    }),
    ...(name !== undefined && { name: { equals: name, mode: "insensitive" } }),
  };
  const [items, total] = await Promise.all([
    prisma.currency.findMany({ where, skip, take, orderBy: { name: "asc" } }),
    prisma.currency.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.currency.findUnique({ where: { id } });
  if (!item) throw new NotFoundError(`Currency ${id} not found`);
  return item;
}

export function create(data: Prisma.CurrencyCreateInput) {
  return prisma.currency.create({ data });
}

export function update(id: number, data: Prisma.CurrencyUpdateInput) {
  return prisma.currency.update({ where: { id }, data });
}

export async function remove(id: number): Promise<void> {
  await prisma.currency.delete({ where: { id } });
}
