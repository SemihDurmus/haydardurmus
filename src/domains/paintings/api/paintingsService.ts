import { mockPaintings } from '../data/mockPaintings';
import type { Painting } from '../types';

/**
 * Paintings service — all data fetching for paintings goes through here.
 * Currently uses mock data. Replace the implementations to connect to a real API
 * without changing any hook or component code.
 */

export const paintingsService = {
  /** Fetch all paintings for the current artist. */
  async getAll(): Promise<Painting[]> {
    // Simulate network delay in development
    await new Promise((r) => setTimeout(r, 300));
    return mockPaintings;
  },

  /** Fetch a single painting by ID. */
  async getById(id: string): Promise<Painting | null> {
    await new Promise((r) => setTimeout(r, 200));
    return mockPaintings.find((p) => p.id === id) ?? null;
  },

  /** Fetch featured paintings for the home page. */
  async getFeatured(limit = 6): Promise<Painting[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockPaintings.filter((p) => p.isFeatured === true).slice(0, limit);
  },
};
