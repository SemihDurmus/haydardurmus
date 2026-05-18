/** Supported locales. Adding a new language only requires adding to this union. */
export type SupportedLocale = 'en' | 'tr';

/** Multilingual text field — all domain models use this for translatable content. */
export type TranslatedText = Record<SupportedLocale, string>;

/** Reusable image asset — used by collections, media, books, etc. */
export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string; // Base64 blur placeholder
}

/** Money — currency-aware price value. */
export interface Money {
  amount: number;
  currency: string; // ISO 4217
}

/** Generic paginated API response wrapper. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

/** Generic async state — mirrors TanStack Query status. */
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

/** Navigation link used in menus. */
export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

/** SEO metadata for individual pages. */
export interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
}

/** Availability status for artworks — Phase 3 ecommerce. */
export type AvailabilityStatus = 'for_sale' | 'sold' | 'not_for_sale' | 'on_loan';
