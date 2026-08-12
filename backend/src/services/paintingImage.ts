import fs from "node:fs/promises";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";
// Same root the upload middleware writes to (see config/paths.ts).
import { PUBLIC_ROOT } from "../config/paths";

export interface ListArgs {
  skip: number;
  take: number;
  paintingId?: number;
}

export async function list({ skip, take, paintingId }: ListArgs) {
  const where: Prisma.PaintingImageWhereInput = paintingId
    ? { paintingId }
    : {};
  const [items, total] = await Promise.all([
    prisma.paintingImage.findMany({
      where,
      skip,
      take,
      // Primary first, then newest — a stable, useful order for galleries.
      orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
    }),
    prisma.paintingImage.count({ where }),
  ]);
  return { items, total };
}

export async function get(id: number) {
  const item = await prisma.paintingImage.findUnique({ where: { id } });
  if (!item) throw new NotFoundError(`Image ${id} not found`);
  return item;
}

export interface CreateInput {
  paintingId: number;
  filePath: string;
  isPrimary?: boolean;
}

export function create(data: CreateInput) {
  const { paintingId, filePath, isPrimary = false } = data;
  // Fast path: adding a NON-primary image can't break the single-primary
  // invariant, so it's a plain insert — no transaction needed.
  if (!isPrimary) {
    return prisma.paintingImage.create({
      data: {
        filePath,
        isPrimary: false,
        painting: { connect: { id: paintingId } },
      },
    });
  }
  // Promoting on insert: demote the current primary and insert the new one as
  // one all-or-nothing unit, so observers never see zero or two primaries.
  return prisma.$transaction(async (tx) => {
    await tx.paintingImage.updateMany({
      where: { paintingId, isPrimary: true },
      data: { isPrimary: false },
    });
    return tx.paintingImage.create({
      data: {
        filePath,
        isPrimary: true,
        painting: { connect: { id: paintingId } },
      },
    });
  });
}

export interface UpdateInput {
  filePath?: string;
  isPrimary?: boolean;
}

export function update(id: number, data: UpdateInput) {
  // Only a promotion (isPrimary === true) can violate the invariant. A plain
  // filePath edit or a demotion is a single safe update — no transaction.
  if (data.isPrimary !== true) {
    return prisma.paintingImage.update({ where: { id }, data });
  }
  return prisma.$transaction(async (tx) => {
    const current = await tx.paintingImage.findUnique({ where: { id } });
    if (!current) throw new NotFoundError(`Image ${id} not found`);
    await tx.paintingImage.updateMany({
      // Demote every OTHER primary for this painting; exclude self so we don't
      // redundantly demote the row we're about to promote.
      where: {
        paintingId: current.paintingId,
        isPrimary: true,
        NOT: { id },
      },
      data: { isPrimary: false },
    });
    return tx.paintingImage.update({ where: { id }, data });
  });
}

export async function remove(id: number): Promise<void> {
  const image = await prisma.paintingImage.delete({ where: { id } });
  // Best-effort disk cleanup: filePath is "/images/paintings/<id>/<file>" and
  // /images/* is served from public/ (see app.ts). Resolve strictly inside
  // PUBLIC_ROOT so a mangled path can never delete outside the upload tree.
  const rel = image.filePath.replace(/^\/images\//, "");
  const abs = path.resolve(PUBLIC_ROOT, rel);
  if (abs.startsWith(PUBLIC_ROOT + path.sep)) {
    await fs.unlink(abs).catch(() => {
      // The DB row is gone; a missing/undeletable file is not an API error.
    });
  }
}
