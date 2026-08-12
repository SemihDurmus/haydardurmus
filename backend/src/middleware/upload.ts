import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { BadRequestError } from "../utils/errors";
import { PUBLIC_ROOT } from "../config/paths";

// Where uploaded painting images live on disk. Each painting gets its own
// subfolder (<PUBLIC_ROOT>/paintings/<id>/...) so a painting's files stay
// grouped and are easy to find or remove. express.static (see app.ts) serves
// this tree; PUBLIC_ROOT itself is defined in config/paths.ts.

const storage = multer.diskStorage({
  // The destination runs per-file. req.params.id is the painting id from the
  // route (/:id/images); we ensure its subfolder exists before writing.
  destination: (req, _file, cb) => {
    const dir = path.join(PUBLIC_ROOT, "paintings", String(req.params.id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
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
