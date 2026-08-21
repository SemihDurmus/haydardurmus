import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/db/prisma";

/**
 * One-off import of the master paintings CSV (painting_no, technique_id,
 * height_cm, width_cm, radius_cm, year, material_id, artist_id, owner_id,
 * photo, AÇIKLAMA) into the painting table.
 *
 * Scope, by design:
 * - Only rows with a technique_id are imported; blank-technique rows are skipped.
 * - Only NEW paintings are added (createMany + skipDuplicates on the unique
 *   paintingNo) — existing rows in the DB are left untouched, never overwritten.
 * - technique_id/material_id/artist_id/owner_id in the CSV are real DB ids
 *   (verified against the current data), not labels — no name lookup needed.
 * - Blank artist_id defaults to 1 (Haydar Durmuş), per the rest of the sheet.
 * - painting_name has no source column, so every row gets the "Untitled"
 *   sentinel used elsewhere (see scripts/seed.ts).
 * - is_available has no source column and defaults to false for all imported
 *   rows — flip individual paintings to available by hand as needed.
 * - The photo column only ever contains placeholder markers ("YOK"/"BOŞ"),
 *   not real file paths, so it is not imported.
 *
 * Usage: tsx scripts/import-paintings-csv.ts [path/to/file.csv]
 * Defaults to ../paintings_2026.08.21.csv (repo root) if no path is given.
 */
const DEFAULT_ARTIST_ID = 1;

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (inQuotes) {
      if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function toInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number.parseInt(trimmed, 10);
  return Number.isNaN(n) ? null : n;
}

// Decimal fields use a comma as the decimal separator (e.g. "23,5" = 23.5).
function toDecimalString(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.replace(",", ".");
}

async function main() {
  const csvPath = path.resolve(
    process.argv[2] ?? path.join(__dirname, "../../paintings_2026.08.21.csv"),
  );
  const text = fs.readFileSync(csvPath, "utf-8");
  const lines = text.split(/\r\n|\n/).filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error(`Empty CSV: ${csvPath}`);
  const header = parseCsvLine(lines[0]!).map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);

  const idx = {
    paintingNo: col("painting_no"),
    techniqueId: col("technique_id"),
    heightCm: col("height_cm"),
    widthCm: col("width_cm"),
    radiusCm: col("radius_cm"),
    year: col("year"),
    materialId: col("material_id"),
    artistId: col("artist_id"),
    ownerId: col("owner_id"),
  };

  // Validate referenced ids exist, so a typo in the sheet fails loudly
  // instead of silently violating a foreign key mid-import.
  const [techniqueIds, materialIds, artistIds, ownerIds] = await Promise.all([
    prisma.technique.findMany({ select: { id: true } }),
    prisma.material.findMany({ select: { id: true } }),
    prisma.artist.findMany({ select: { id: true } }),
    prisma.owner.findMany({ select: { id: true } }),
  ]);
  const validTechnique = new Set(techniqueIds.map((r) => r.id));
  const validMaterial = new Set(materialIds.map((r) => r.id));
  const validArtist = new Set(artistIds.map((r) => r.id));
  const validOwner = new Set(ownerIds.map((r) => r.id));

  let skippedNoTechnique = 0;
  let skippedInvalidRef = 0;
  let skippedBadDimensions = 0;
  const invalidRefRows: string[] = [];
  const badDimensionRows: string[] = [];

  const candidates: {
    paintingNo: string;
    paintingName: string;
    heightCm: string | null;
    widthCm: string | null;
    radiusCm: string | null;
    year: number | null;
    techniqueId: number;
    materialId: number | null;
    artistId: number;
    ownerId: number | null;
    isAvailable: boolean;
  }[] = [];

  for (const line of lines.slice(1)) {
    const f = parseCsvLine(line);
    const paintingNo = f[idx.paintingNo]?.trim();
    if (!paintingNo) continue;

    const techniqueId = toInt(f[idx.techniqueId] ?? "");
    if (techniqueId === null) {
      skippedNoTechnique++;
      continue;
    }

    const materialId = toInt(f[idx.materialId] ?? "");
    const artistId = toInt(f[idx.artistId] ?? "") ?? DEFAULT_ARTIST_ID;
    const ownerId = toInt(f[idx.ownerId] ?? "");

    if (
      !validTechnique.has(techniqueId) ||
      (materialId !== null && !validMaterial.has(materialId)) ||
      !validArtist.has(artistId) ||
      (ownerId !== null && !validOwner.has(ownerId))
    ) {
      skippedInvalidRef++;
      invalidRefRows.push(paintingNo);
      continue;
    }

    const heightCm = toDecimalString(f[idx.heightCm] ?? "");
    const widthCm = toDecimalString(f[idx.widthCm] ?? "");
    const radiusCm = toDecimalString(f[idx.radiusCm] ?? "");
    // DB check constraint chk_dimensions: (width AND height, no radius) OR (radius only).
    const rectangular = widthCm !== null && heightCm !== null && radiusCm === null;
    const circular = radiusCm !== null && widthCm === null && heightCm === null;
    if (!rectangular && !circular) {
      skippedBadDimensions++;
      badDimensionRows.push(paintingNo);
      continue;
    }

    candidates.push({
      paintingNo,
      paintingName: "Untitled",
      heightCm,
      widthCm,
      radiusCm,
      year: toInt(f[idx.year] ?? ""),
      techniqueId,
      materialId,
      artistId,
      ownerId,
      isAvailable: false,
    });
  }

  const result = await prisma.painting.createMany({
    data: candidates,
    skipDuplicates: true,
  });

  // eslint-disable-next-line no-console
  console.log(`Rows in CSV (excl. header): ${lines.length - 1}`);
  // eslint-disable-next-line no-console
  console.log(`Skipped (no technique_id): ${skippedNoTechnique}`);
  // eslint-disable-next-line no-console
  console.log(`Skipped (invalid FK reference): ${skippedInvalidRef}`);
  if (invalidRefRows.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`  painting_no with invalid refs: ${invalidRefRows.join(", ")}`);
  }
  // eslint-disable-next-line no-console
  console.log(`Skipped (dimensions fail chk_dimensions): ${skippedBadDimensions}`);
  if (badDimensionRows.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`  painting_no with bad dimensions: ${badDimensionRows.join(", ")}`);
  }
  // eslint-disable-next-line no-console
  console.log(`Candidates (technique_id present + refs + dimensions valid): ${candidates.length}`);
  // eslint-disable-next-line no-console
  console.log(`Inserted: ${result.count}`);
  // eslint-disable-next-line no-console
  console.log(`Already existed (skipped as duplicate paintingNo): ${candidates.length - result.count}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Import FAILED:", (err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
