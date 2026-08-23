import { useMemo } from 'react';
import { useFeaturedPaintings } from '@domains/paintings/hooks/usePaintings';
import { PaintingImageGrid } from '@domains/paintings/components/PaintingImageGrid';

// One shuffle seed per page load — drawn at module scope so render stays pure.
const SHUFFLE_SEED = Math.floor(Math.random() * 2 ** 32);

/** Deterministic Fisher–Yates shuffle driven by a mulberry32 PRNG. */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  let state = seed;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function FeaturedPaintingImages() {
  const { data } = useFeaturedPaintings(12);

  // Shuffle once per fetched set so the home grid varies between visits without
  // re-ordering on every render.
  const featuredPaintings = useMemo(() => seededShuffle(data ?? [], SHUFFLE_SEED), [data]);

  return <PaintingImageGrid paintings={featuredPaintings} />;
}
