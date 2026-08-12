import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

export interface ListArgs {
  skip: number;
  take: number;
  paintingId?: number;
  isRead?: boolean;
}

// A message only needs to say "re: which painting" — so we SELECT three fields
// instead of include-ing the full painting graph (cheaper, and it avoids
// leaking internal painting data onto this public-facing surface).
const paintingProjection = {
  select: { id: true, paintingNo: true, paintingName: true },
} satisfies Prisma.ContactMessage$paintingArgs;

export async function list({ skip, take, paintingId, isRead }: ListArgs) {
  const where: Prisma.ContactMessageWhereInput = {
    ...(paintingId !== undefined && { paintingId }),
    ...(isRead !== undefined && { isRead }),
  };
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { painting: paintingProjection },
    }),
    prisma.contactMessage.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.contactMessage.findUnique({
    where: { id },
    include: { painting: paintingProjection },
  });
  if (!item) throw new NotFoundError(`Message ${id} not found`);
  return item;
}

export function create(
  data:
    | Prisma.ContactMessageCreateInput
    | Prisma.ContactMessageUncheckedCreateInput,
) {
  return prisma.contactMessage.create({
    data,
    include: { painting: paintingProjection },
  });
}

export function update(
  id: number,
  data:
    | Prisma.ContactMessageUpdateInput
    | Prisma.ContactMessageUncheckedUpdateInput,
) {
  return prisma.contactMessage.update({
    where: { id },
    data,
    include: { painting: paintingProjection },
  });
}

export async function remove(id: number): Promise<void> {
  await prisma.contactMessage.delete({ where: { id } });
}
