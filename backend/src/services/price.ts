import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

export interface ListArgs {
  skip: number;
  take: number;
  paintingId?: number;
  currentOnly?: boolean;
}

export async function list({ skip, take, paintingId, currentOnly }: ListArgs) {
  const where: Prisma.PriceWhereInput = {
    ...(paintingId !== undefined && { paintingId }),
    ...(currentOnly && { isCurrent: true }),
  };
  const [items, total] = await Promise.all([
    prisma.price.findMany({
      where,
      skip,
      take,
      // Newest effective date first; createdAt breaks ties on same-day prices.
      orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
      include: { currency: true },
    }),
    prisma.price.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.price.findUnique({
    where: { id },
    include: { currency: true },
  });
  if (!item) throw new NotFoundError(`Price ${id} not found`);
  return item;
}

export interface CreateInput {
  paintingId: number;
  currencyId: number;
  amount: number | string;
  effectiveDate?: Date;
}

export function create(data: CreateInput) {
  // Always transactional: a new price IS the new current price, so we demote the
  // painting's prior current price, then insert — as one all-or-nothing unit.
  return prisma.$transaction(async (tx) => {
    await tx.price.updateMany({
      where: { paintingId: data.paintingId, isCurrent: true },
      data: { isCurrent: false },
    });
    return tx.price.create({
      data: {
        amount: data.amount,
        isCurrent: true,
        ...(data.effectiveDate !== undefined && {
          effectiveDate: data.effectiveDate,
        }),
        painting: { connect: { id: data.paintingId } },
        currency: { connect: { id: data.currencyId } },
      },
      include: { currency: true },
    });
  });
}

export interface UpdateInput {
  amount?: number | string;
  effectiveDate?: Date;
}

export function update(id: number, data: UpdateInput) {
  // Plain update: only amount/effectiveDate are mutable. Reassigning "current"
  // is done by POSTing a new price, never by editing this row's isCurrent.
  return prisma.price.update({
    where: { id },
    data,
    include: { currency: true },
  });
}

export async function remove(id: number): Promise<void> {
  await prisma.price.delete({ where: { id } });
}
