import {
  applyFilters,
  countActiveFilters,
  isFiltersEmpty,
  parseFiltersFromParams,
  serializeFiltersToParams,
  extractYears,
} from '../filters';
import { EMPTY_FILTERS } from '../../types';
import type { Painting, PaintingFilters } from '../../types';

const mockPaintings: Painting[] = [
  {
    id: 'p001',
    paintingNo: 'HD-001',
    paintingName: 'Morning Light',
    width: 80,
    height: 100,
    radius: null,
    artistId: 'a1',
    year: 2023,
    techniqueId: 'oil',
    materialId: 'canvas',
    locationCityId: 'istanbul',
    ownerId: 'artist',
  },
  {
    id: 'p002',
    paintingNo: 'HD-002',
    paintingName: 'Silent Horizon',
    width: 120,
    height: 90,
    radius: null,
    artistId: 'a1',
    year: 2022,
    techniqueId: 'oil',
    materialId: 'linen',
    locationCityId: 'paris',
    ownerId: 'private_eu',
  },
  {
    id: 'p003',
    paintingNo: 'HD-003',
    paintingName: null,
    width: 40,
    height: 50,
    radius: null,
    artistId: 'a1',
    year: 2020,
    techniqueId: 'watercolor',
    materialId: 'paper',
    locationCityId: 'istanbul',
    ownerId: 'artist',
  },
];

describe('applyFilters', () => {
  it('returns all paintings when filters are empty', () => {
    const result = applyFilters(mockPaintings, EMPTY_FILTERS);
    expect(result).toHaveLength(3);
  });

  it('filters by year', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, years: [2023] };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p001');
  });

  it('filters by multiple years', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, years: [2022, 2023] };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(2);
  });

  it('filters by technique', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, techniqueIds: ['watercolor'] };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p003');
  });

  it('filters by material', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, materialIds: ['linen'] };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p002');
  });

  it('filters by location city', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, locationCityIds: ['istanbul'] };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(2);
  });

  it('filters by multiple dimensions simultaneously', () => {
    const filters: PaintingFilters = {
      ...EMPTY_FILTERS,
      techniqueIds: ['oil'],
      locationCityIds: ['istanbul'],
    };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p001');
  });

  it('filters by search text — matches name', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, search: 'morning' };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p001');
  });

  it('filters by search text — matches painting number', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, search: 'HD-003' };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p003');
  });

  it('search is case-insensitive', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, search: 'MORNING' };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
  });

  it('returns empty array when no paintings match', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, years: [1900] };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(0);
  });

  it('filters by width range', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, widthMin: 100 };
    const result = applyFilters(mockPaintings, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p002');
  });
});

describe('countActiveFilters', () => {
  it('returns 0 for empty filters', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  });

  it('counts each active dimension', () => {
    const filters: PaintingFilters = {
      ...EMPTY_FILTERS,
      years: [2023],
      techniqueIds: ['oil'],
    };
    expect(countActiveFilters(filters)).toBe(2);
  });

  it('counts search as one filter', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, search: 'test' };
    expect(countActiveFilters(filters)).toBe(1);
  });

  it('does not count whitespace-only search', () => {
    const filters: PaintingFilters = { ...EMPTY_FILTERS, search: '   ' };
    expect(countActiveFilters(filters)).toBe(0);
  });
});

describe('isFiltersEmpty', () => {
  it('returns true for empty filters', () => {
    expect(isFiltersEmpty(EMPTY_FILTERS)).toBe(true);
  });

  it('returns false when any filter is active', () => {
    expect(isFiltersEmpty({ ...EMPTY_FILTERS, years: [2023] })).toBe(false);
  });
});

describe('parseFiltersFromParams / serializeFiltersToParams', () => {
  it('round-trips filters through URL params', () => {
    const original: PaintingFilters = {
      ...EMPTY_FILTERS,
      search: 'test',
      years: [2022, 2023],
      techniqueIds: ['oil', 'acrylic'],
    };

    const params = serializeFiltersToParams(original);
    const parsed = parseFiltersFromParams(params);

    expect(parsed.search).toBe('test');
    expect(parsed.years).toEqual([2022, 2023]);
    expect(parsed.techniqueIds).toEqual(['oil', 'acrylic']);
  });

  it('produces empty filters from empty params', () => {
    const params = new URLSearchParams();
    const parsed = parseFiltersFromParams(params);
    expect(isFiltersEmpty(parsed)).toBe(true);
  });

  it('ignores invalid number values', () => {
    const params = new URLSearchParams('year=notanumber,2023');
    const parsed = parseFiltersFromParams(params);
    expect(parsed.years).toEqual([2023]);
  });
});

describe('extractYears', () => {
  it('extracts unique years sorted descending', () => {
    const years = extractYears(mockPaintings);
    expect(years).toEqual([2023, 2022, 2020]);
  });

  it('ignores null years', () => {
    const paintings: Painting[] = [
      { ...mockPaintings[0], year: null },
      { ...mockPaintings[1], year: 2022 },
    ];
    expect(extractYears(paintings)).toEqual([2022]);
  });
});
