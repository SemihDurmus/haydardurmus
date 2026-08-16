import fs from "node:fs";
import path from "node:path";
import { PUBLIC_ROOT } from "../config/paths";
import { BadRequestError } from "./errors";

/**
 * Where a painting's image files live on disk, and the URL they're served at.
 *
 * Folders are named by the painting's painting_no (its inventory number), so
 * public/paintings/8597/ holds every image of painting 8597 — a layout a human
 * can navigate without consulting the database. The database mirrors this:
 * painting_image.painting_no is maintained by triggers (see the schema), which
 * is what lets a rename be detected and the folder moved to match.
 *
 * Everything that touches these paths goes through this module — the upload
 * middleware, the upload controller, the delete service, and the rename hook —
 * so the layout is defined exactly once.
 */

/** Root of the per-painting folders: <PUBLIC_ROOT>/paintings. */
const PAINTINGS_ROOT = path.join(PUBLIC_ROOT, "paintings");

/**
 * painting_no doubles as a directory name, so it must be a single safe path
 * segment. Without this, a painting numbered '../../etc' would write outside
 * PUBLIC_ROOT entirely. Leading dots are excluded too: they'd create hidden
 * folders, and '..' is the traversal case itself.
 *
 * The API enforces the same pattern at the Zod layer (routes/painting.ts) so
 * a bad number is a 400 at the edge rather than an exception down here; this
 * is the backstop for anything that reaches the filesystem another way.
 */
export const PAINTING_NO_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function assertSafePaintingNo(paintingNo: string): void {
  if (!PAINTING_NO_PATTERN.test(paintingNo)) {
    throw new BadRequestError(
      "paintingNo must contain only letters, digits, dot, underscore or hyphen, and must not start with a dot",
    );
  }
}

/** Absolute path to a painting's folder. Validates before joining. */
export function paintingDir(paintingNo: string): string {
  assertSafePaintingNo(paintingNo);
  const dir = path.join(PAINTINGS_ROOT, paintingNo);

  // Belt and braces: even with the pattern above, confirm the result really
  // is inside PAINTINGS_ROOT before any caller writes to it.
  const relative = path.relative(PAINTINGS_ROOT, dir);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new BadRequestError("Invalid paintingNo");
  }
  return dir;
}

/** The public URL for a stored file, as saved in painting_image.file_path. */
export function paintingImageUrl(paintingNo: string, filename: string): string {
  assertSafePaintingNo(paintingNo);
  return `/images/paintings/${paintingNo}/${filename}`;
}

/**
 * Move a painting's folder after its painting_no changed, so the files follow
 * the number. Best-effort by design: a failure here must not roll back the
 * rename itself, because painting_image.file_path is rewritten in the same
 * transaction and is the actual source of truth for what the site serves.
 *
 * Returns true if a directory was moved.
 */
export function renamePaintingDir(oldNo: string, newNo: string): boolean {
  if (oldNo === newNo) return false;
  const from = paintingDir(oldNo);
  const to = paintingDir(newNo);

  if (!fs.existsSync(from)) return false; // painting had no images yet

  // Refuse to merge into an existing folder: that would mean two paintings
  // share a number, which the UNIQUE constraint on painting_no prevents, so
  // reaching here means something is already wrong and clobbering files would
  // make it worse.
  if (fs.existsSync(to)) {
    throw new BadRequestError(
      `Cannot move images to '${newNo}': that folder already exists`,
    );
  }

  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  return true;
}
