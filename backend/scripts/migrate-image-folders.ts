/**
 * One-off migration: move painting images from id-named folders to
 * painting_no-named folders.
 *
 *   public/paintings/39/1782685266199.png  ->  public/paintings/8597/1782685266199.png
 *   file_path: /images/paintings/39/...    ->  /images/paintings/8597/...
 *
 * Idempotent: rows already pointing at the painting_no folder are skipped, so
 * re-running is a no-op. Nothing is deleted — files are moved, and if a move
 * fails the database row is left alone so the two never disagree.
 *
 *   npx tsx scripts/migrate-image-folders.ts          # dry run, changes nothing
 *   npx tsx scripts/migrate-image-folders.ts --apply  # do it
 */
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/db/prisma";
import { PUBLIC_ROOT } from "../src/config/paths";
import { paintingImageUrl, assertSafePaintingNo } from "../src/utils/paintingFiles";

const APPLY = process.argv.includes("--apply");
const PAINTINGS_ROOT = path.join(PUBLIC_ROOT, "paintings");

async function main() {
  console.log(APPLY ? "APPLYING changes\n" : "DRY RUN — nothing will change\n");
  console.log(`paintings root: ${PAINTINGS_ROOT}\n`);

  const images = await prisma.paintingImage.findMany({
    select: {
      id: true,
      filePath: true,
      paintingId: true,
      painting: { select: { paintingNo: true } },
    },
    orderBy: { id: "asc" },
  });

  let moved = 0;
  let rewritten = 0;
  let skipped = 0;

  // Move directories first, one per painting, then fix the rows that point
  // into them.
  const byPainting = new Map<number, string>();
  for (const img of images) byPainting.set(img.paintingId, img.painting.paintingNo);

  for (const [paintingId, paintingNo] of byPainting) {
    assertSafePaintingNo(paintingNo);
    const from = path.join(PAINTINGS_ROOT, String(paintingId));
    const to = path.join(PAINTINGS_ROOT, paintingNo);

    if (from === to) continue; // painting_no happens to equal the id
    if (!fs.existsSync(from)) continue; // already moved, or never had files

    if (fs.existsSync(to)) {
      console.log(`SKIP  ${from} -> ${to}  (destination already exists)`);
      continue;
    }

    console.log(`MOVE  paintings/${paintingId}  ->  paintings/${paintingNo}`);
    if (APPLY) fs.renameSync(from, to);
    moved++;
  }

  for (const img of images) {
    const filename = img.filePath.split("/").pop();
    if (!filename) {
      console.log(`SKIP  image ${img.id}: cannot parse filename from ${img.filePath}`);
      skipped++;
      continue;
    }
    const next = paintingImageUrl(img.painting.paintingNo, filename);
    if (next === img.filePath) {
      skipped++;
      continue;
    }
    console.log(`PATH  image ${img.id}: ${img.filePath}  ->  ${next}`);
    if (APPLY) {
      await prisma.paintingImage.update({
        where: { id: img.id },
        data: { filePath: next },
      });
    }
    rewritten++;
  }

  // Folders on disk that no painting claims — left in place, just reported.
  if (fs.existsSync(PAINTINGS_ROOT)) {
    const claimed = new Set(byPainting.values());
    const orphans = fs
      .readdirSync(PAINTINGS_ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !claimed.has(e.name))
      .map((e) => e.name);
    if (orphans.length) {
      console.log(`\nUnclaimed folders (left untouched): ${orphans.join(", ")}`);
    }
  }

  console.log(
    `\n${APPLY ? "done" : "would do"}: ${moved} folder(s) moved, ` +
      `${rewritten} path(s) rewritten, ${skipped} already correct`,
  );
  if (!APPLY && (moved || rewritten)) console.log("re-run with --apply to commit");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("FAILED:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
