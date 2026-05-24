import type { ImageAsset, TranslatedText, AvailabilityStatus } from '@shared/types';

/**
 * Core Painting model — v1.
 * Designed for extensibility: new fields should be added as optional
 * to maintain backward compatibility with existing data.
 */
export interface Painting {
  id: string;
  paintingNo: string;
  paintingName: string | null;
  width: number | null;
  height: number | null;
  radius: number | null;
  artistId: string;
  year: number | null;
  techniqueId: string | null;
  materialId: string | null;
  locationCityId: string | null;
  ownerId: string | null;

  // Phase 2 extensions — optional for backward compatibility
  images?: ImageAsset[];
  slug?: string;
  description?: TranslatedText;
  collectionId?: string | null;
  tags?: string[];
  isFeatured?: boolean;

  // Phase 3 extensions — ecommerce
  availability?: AvailabilityStatus;
}

/** Lookup table entries — techniques, materials, cities, owners */
export interface PaintingLookup {
  id: string;
  label: string;
  labelTr?: string;
}

export interface PaintingTechnique extends PaintingLookup {}
export interface PaintingMaterial extends PaintingLookup {}
export interface PaintingCity extends PaintingLookup {}
export interface PaintingOwner extends PaintingLookup {}

/** All available filter dimensions */
export interface PaintingFilters {
  search: string;
  years: number[];
  techniqueIds: string[];
  materialIds: string[];
  ownerIds: string[];
  widthMin: number | null;
  widthMax: number | null;
  heightMin: number | null;
  heightMax: number | null;
}

/** Sort options */
export type PaintingSortKey =
  | 'year_desc'
  | 'year_asc'
  | 'no_asc'
  | 'no_desc'
  | 'name_asc'
  | 'name_desc'
  | 'size_desc'
  | 'size_asc';

export const DEFAULT_SORT: PaintingSortKey = 'year_desc';

export const EMPTY_FILTERS: PaintingFilters = {
  search: '',
  years: [],
  techniqueIds: [],
  materialIds: [],
  ownerIds: [],
  widthMin: null,
  widthMax: null,
  heightMin: null,
  heightMax: null,
};

/** URL query param key names */
export const FILTER_PARAMS = {
  search: 'q',
  years: 'year',
  techniqueIds: 'technique',
  materialIds: 'material',
  ownerIds: 'owner',
  widthMin: 'w_min',
  widthMax: 'w_max',
  heightMin: 'h_min',
  heightMax: 'h_max',
  sort: 'sort',
} as const;
