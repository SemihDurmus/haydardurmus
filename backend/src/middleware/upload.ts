import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { prisma } from "../db/prisma";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { paintingDir } from "../utils/paintingFiles";

// Where uploaded painting images live on disk. Each painting gets its own
// subfolder named by its painting_no — <PUBLIC_ROOT>/paintings/8597/... — so
// the folders are meaningful to a human browsing the volume, and match
// painting_image.painting_no in the database. express.static (see app.ts)
// serves this tree; the layout itself is defined in utils/paintingFiles.ts.

/**
 * Resolve the painting's number before multer touches the disk.
 *
 * Two reasons this runs first rather than inside the destination callback:
 * the lookup is async, and an unknown painting id should be a clean 404
 * instead of a file written into a folder for a painting that doesn't exist.
 */
export async function resolvePaintingFolder(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestError("Invalid painting id");
    }
    const painting = await prisma.painting.findUnique({
      where: { id },
      select: { paintingNo: true },
    });
    if (!painting) throw new NotFoundError(`Painting ${id} not found`);
    req.paintingNo = painting.paintingNo;
    next();
  } catch (err) {
    next(err);
  }
}

const storage = multer.diskStorage({
  // Runs per file. resolvePaintingFolder has already put the painting's number
  // on the request; paintingDir() validates it and keeps the result inside
  // PUBLIC_ROOT.
  destination: (req, _file, cb) => {
    try {
      if (!req.paintingNo) {
        throw new BadRequestError(
          "Painting folder not resolved — resolvePaintingFolder must run before this middleware",
        );
      }
      const dir = paintingDir(req.paintingNo);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err as Error, "");
    }
  },
  // A timestamped name avoids collisions while keeping the original extension.
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}${ext}`);
  },
});

// Accept a single file under the form field "image". Reject non-images and cap
// the size so a stray upload can't fill the disk.
export const uploadPaintingImage = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new BadRequestError("Only image files are allowed"));
  },
}).single("image");
