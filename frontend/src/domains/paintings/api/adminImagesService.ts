import { apiDelete, apiGet, apiPut } from '@shared/api/client';

/**
 * Admin operations on the painting-images resource. Like the other admin
 * services this speaks the backend shape directly (numeric ids, raw filePath).
 * Uploading a NEW image goes through `adminPaintingsService.uploadImage`
 * (multipart to /paintings/:id/images); this service manages existing records.
 */
export interface RawPaintingImage {
  id: number;
  paintingId: number;
  /** The painting's physical number (written on the back of the canvas).
   *  Read-only — the database derives it from the parent painting. */
  paintingNo: string;
  filePath: string;
  isPrimary: boolean;
  uploadedAt: string;
}

interface Envelope<T> {
  data: T[];
}

export const adminImagesService = {
  /** All images for one painting, primary first (backend order). */
  listForPainting: (paintingId: number | string) =>
    apiGet<Envelope<RawPaintingImage>>(
      `/painting-images?paintingId=${paintingId}&limit=100`,
    ).then((r) => r.data),

  /** Promote an image to primary (backend demotes the old one atomically). */
  setPrimary: (id: number) => apiPut<RawPaintingImage>(`/painting-images/${id}`, { isPrimary: true }),

  /** Delete an image record (the backend also removes the file from disk). */
  remove: (id: number) => apiDelete(`/painting-images/${id}`),
};
