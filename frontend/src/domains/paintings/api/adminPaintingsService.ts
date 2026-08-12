import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '@shared/api/client';
import type { RawPaintingImage } from './adminImagesService';

/**
 * Write-side painting operations for the admin panel. These speak the backend's
 * shape directly (numeric ids, `*Cm` fields) rather than the frontend `Painting`
 * model — the form collects exactly what the API needs, so no mapping back.
 */
export interface PaintingInput {
  paintingNo: string;
  paintingName: string;
  widthCm: number | null;
  heightCm: number | null;
  radiusCm: number | null;
  artistId: number;
  year: number | null;
  techniqueId: number | null;
  materialId: number | null;
  locationCityId: number | null;
  ownerId: number | null;
  isAvailable: boolean;
}

/** A backend painting record as returned on read (decimals are JSON strings). */
export interface RawPainting {
  id: number;
  paintingNo: string;
  paintingName: string;
  widthCm: string | null;
  heightCm: string | null;
  radiusCm: string | null;
  artistId: number;
  year: number | null;
  techniqueId: number | null;
  materialId: number | null;
  locationCityId: number | null;
  ownerId: number | null;
  isAvailable: boolean;
}

export const adminPaintingsService = {
  get: (id: number | string) => apiGet<RawPainting>(`/paintings/${id}`),
  create: (input: PaintingInput) => apiPost<RawPainting>('/paintings', input),
  update: (id: number | string, input: PaintingInput) =>
    apiPut<RawPainting>(`/paintings/${id}`, input),
  remove: (id: number | string) => apiDelete(`/paintings/${id}`),

  /** Flip availability only (backend PUT is partial). */
  setAvailable: (id: number | string, isAvailable: boolean) =>
    apiPut<RawPainting>(`/paintings/${id}`, { isAvailable }),

  /** Upload an image file for a painting (multipart, field name "image"). */
  uploadImage: (id: number | string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return apiUpload<RawPaintingImage>(
      `/paintings/${id}/images`,
      form,
    );
  },
};
