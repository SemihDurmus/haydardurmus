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

  // Lookup ids, used for filtering (server-side) and for URL query params.
  // The backend's real numeric ids, stringified — not slugs — since the API
  // filters paintings by these directly (?technique=3,7 etc.).
  techniqueId: string | null;
  materialId: string | null;
  locationCityId: string | null;
  ownerId: string | null;

  // The display labels for those lookups, in both languages, exactly as the
  // database holds them. The frontend keeps no translation table of its own:
  // if a technique is renamed or its Turkish corrected in the admin panel,
  // the site follows without a deploy.
  technique: TranslatedText | null;
  material: TranslatedText | null;
  locationCity: TranslatedText | null;
  /** A person's name — not translated, so a plain string. */
  owner: string | null;

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

/**
 * A selectable filter option, derived at runtime from the paintings the API
 * returned. There is deliberately no hardcoded list of techniques or
 * materials in this codebase — see utils/filters.ts#extractLookupOptions.
 */
export interface PaintingLookupOption {
  id: string;
  label: string;
}

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
