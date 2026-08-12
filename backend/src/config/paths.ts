import path from "node:path";

/**
 * Root directory for uploaded painting images.
 *
 * Files are written to <PUBLIC_ROOT>/paintings/<id>/ by middleware/upload.ts,
 * deleted from there by services/paintingImage.ts, and served from there at
 * /images/* by app.ts — so all three must agree, hence this single source.
 *
 * It defaults to <cwd>/public (the local layout). On a host with a mounted
 * volume, either mount the volume at <cwd>/public — /app/public on Railway —
 * or point UPLOADS_ROOT at the mount path. Getting this wrong means uploads
 * land on the container's ephemeral disk and vanish on the next deploy, so
 * always verify an image survives a restart.
 */
export const PUBLIC_ROOT = process.env.UPLOADS_ROOT ?? path.join(process.cwd(), "public");
