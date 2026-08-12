import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lookupsService, type LookupOption } from '../api/lookupsService';
import {
  adminPaintingsService,
  type PaintingInput,
} from '../api/adminPaintingsService';
import { adminImagesService } from '../api/adminImagesService';
import { adminPricesService, type PriceInput } from '../api/adminPricesService';
import { paintingKeys } from './usePaintings';

/** All lookup option lists the painting form needs, fetched in parallel. */
export interface PaintingLookups {
  artists: LookupOption[];
  techniques: LookupOption[];
  materials: LookupOption[];
  cities: LookupOption[];
  owners: LookupOption[];
}

export function usePaintingLookups() {
  const artists = useQuery({ queryKey: ['lookups', 'artists'], queryFn: lookupsService.artists });
  const techniques = useQuery({
    queryKey: ['lookups', 'techniques'],
    queryFn: lookupsService.techniques,
  });
  const materials = useQuery({
    queryKey: ['lookups', 'materials'],
    queryFn: lookupsService.materials,
  });
  const cities = useQuery({ queryKey: ['lookups', 'cities'], queryFn: lookupsService.cities });
  const owners = useQuery({ queryKey: ['lookups', 'owners'], queryFn: lookupsService.owners });

  const lookups: PaintingLookups = {
    artists: artists.data ?? [],
    techniques: techniques.data ?? [],
    materials: materials.data ?? [],
    cities: cities.data ?? [],
    owners: owners.data ?? [],
  };
  const isLoading =
    artists.isLoading ||
    techniques.isLoading ||
    materials.isLoading ||
    cities.isLoading ||
    owners.isLoading;

  return { lookups, isLoading };
}

/** Fetch one painting in its raw backend shape (for editing). */
export function useAdminPainting(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-painting', id],
    queryFn: () => adminPaintingsService.get(id as string),
    enabled: Boolean(id),
  });
}

// Mutations invalidate every painting query so the public gallery and admin
// list both refetch the change.
function useInvalidatePaintings() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: paintingKeys.all });
}

export function useCreatePainting() {
  const invalidate = useInvalidatePaintings();
  return useMutation({
    mutationFn: (input: PaintingInput) => adminPaintingsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePainting(id: string) {
  const invalidate = useInvalidatePaintings();
  return useMutation({
    mutationFn: (input: PaintingInput) => adminPaintingsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeletePainting() {
  const invalidate = useInvalidatePaintings();
  return useMutation({
    mutationFn: (id: number | string) => adminPaintingsService.remove(id),
    onSuccess: invalidate,
  });
}

export function useSetPaintingAvailable() {
  const invalidate = useInvalidatePaintings();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      adminPaintingsService.setAvailable(id, isAvailable),
    onSuccess: invalidate,
  });
}

// ---------------------------------------------------------------------------
// Images (edit page panel)

const imageKeys = {
  forPainting: (paintingId: string) => ['admin-painting-images', paintingId] as const,
};

export function usePaintingImages(paintingId: string | undefined) {
  return useQuery({
    queryKey: imageKeys.forPainting(paintingId ?? ''),
    queryFn: () => adminImagesService.listForPainting(paintingId as string),
    enabled: Boolean(paintingId),
  });
}

/** Invalidate the image panel + every painting query (cards show the primary). */
function useInvalidateImages(paintingId: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: imageKeys.forPainting(paintingId) });
    void qc.invalidateQueries({ queryKey: paintingKeys.all });
  };
}

export function useUploadPaintingImage(paintingId: string) {
  const invalidate = useInvalidateImages(paintingId);
  return useMutation({
    mutationFn: (file: File) => adminPaintingsService.uploadImage(paintingId, file),
    onSuccess: invalidate,
  });
}

export function useSetPrimaryImage(paintingId: string) {
  const invalidate = useInvalidateImages(paintingId);
  return useMutation({
    mutationFn: (imageId: number) => adminImagesService.setPrimary(imageId),
    onSuccess: invalidate,
  });
}

export function useDeletePaintingImage(paintingId: string) {
  const invalidate = useInvalidateImages(paintingId);
  return useMutation({
    mutationFn: (imageId: number) => adminImagesService.remove(imageId),
    onSuccess: invalidate,
  });
}

// ---------------------------------------------------------------------------
// Prices (edit page panel)

const priceKeys = {
  forPainting: (paintingId: string) => ['admin-painting-prices', paintingId] as const,
};

export function usePaintingPrices(paintingId: string | undefined) {
  return useQuery({
    queryKey: priceKeys.forPainting(paintingId ?? ''),
    queryFn: () => adminPricesService.listForPainting(paintingId as string),
    enabled: Boolean(paintingId),
  });
}

/** Invalidate the price panel + every painting query (cards show the current price). */
function useInvalidatePrices(paintingId: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: priceKeys.forPainting(paintingId) });
    void qc.invalidateQueries({ queryKey: paintingKeys.all });
  };
}

export function useCreatePrice(paintingId: string) {
  const invalidate = useInvalidatePrices(paintingId);
  return useMutation({
    mutationFn: (input: PriceInput) => adminPricesService.create(input),
    onSuccess: invalidate,
  });
}

export function useDeletePrice(paintingId: string) {
  const invalidate = useInvalidatePrices(paintingId);
  return useMutation({
    mutationFn: (priceId: number) => adminPricesService.remove(priceId),
    onSuccess: invalidate,
  });
}

/** Currency options for the price panel's select. */
export function useCurrencyLookups() {
  return useQuery({ queryKey: ['lookups', 'currencies'], queryFn: lookupsService.currencies });
}
