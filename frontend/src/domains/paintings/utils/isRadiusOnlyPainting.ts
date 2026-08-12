import type { Painting } from '../types';

/** True when the painting has a diameter (radius) but no rectangular width/height. */
export function isRadiusOnlyPainting(
  painting: Pick<Painting, 'width' | 'height' | 'radius'>
): boolean {
  return painting.radius !== null && painting.width === null && painting.height === null;
}
