import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

// The service is the pure data layer: it talks to Prisma and throws typed
// errors, but knows nothing about HTTP (no req/res). That keeps it testable
// and reusable, and lets the controller stay thin.

export interface ListArgs {
  skip: number;
  take: number;
  name?: string;
  search?: string;
}

// One round-trip to fetch the page AND the total, run in parallel with
// Promise.all so the two queries overlap instead of waiting in series.
export async function list({ skip, take, name, search }: ListArgs) {
  // Name lookup so the frontend can resolve a human name to an id: ?name= is an
  // exact (case-insensitive) match, ?search= a partial `contains`. If both are
  // sent, exact wins — its spread is last, overriding the same `name` key.
  const where: Prisma.NationalityWhereInput = {
    ...(search !== undefined && {
      name: { contains: search, mode: "insensitive" },
    }),
    ...(name !== undefined && { name: { equals: name, mode: "insensitive" } }),
  };
  const [items, total] = await Promise.all([
    prisma.nationality.findMany({ where, skip, take, orderBy: { name: "asc" } }),
    prisma.nationality.count({ where }),
  ]);
  return { items, total };
}

// findUnique returns null when nothing matches; we turn that into a 404 here
// so every caller doesn't have to repeat the check.
export async function get(id: number) {
  const item = await prisma.nationality.findUnique({ where: { id } });
  if (!item) throw new NotFoundError(`Nationality ${id} not found`);
  return item;
}

// Prisma.NationalityCreateInput / UpdateInput are the generated types for the
// accepted shape; a duplicate name surfaces as P2002 → 409 in the errorHandler.
export function create(data: Prisma.NationalityCreateInput) {
  return prisma.nationality.create({ data });
}

export function update(id: number, data: Prisma.NationalityUpdateInput) {
  return prisma.nationality.update({ where: { id }, data });
}

// A missing id raises P2025 → 404; an FK still referencing it raises P2003 → 400.
export async function remove(id: number): Promise<void> {
  await prisma.nationality.delete({ where: { id } });
}
