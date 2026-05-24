import type { SupportedLocale } from '@shared/types';

/** Combine technique and material labels for display. */
export function formatTechniqueMaterial(
  technique: string | null,
  material: string | null,
  locale: SupportedLocale = 'en'
): string | null {
  if (technique && material) {
    if (locale === 'tr') {
      return `${material} üzerine ${technique}`;
    }

    return `${technique} on ${material}`;
  }

  if (technique) return technique;

  if (material) {
    if (locale === 'tr') {
      return `${material} üzerine`;
    }

    return `On ${material.toLowerCase()}`;
  }

  return null;
}
