import {
  applyFilters,
  countActiveFilters,
  isFiltersEmpty,
  parseFiltersFromParams,
  serializeFiltersToParams,
  extractYears,
  extractLookupOptions,
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
    technique: { en: 'Oil', tr: 'Yağlıboya' },
    material: { en: 'Canvas', tr: 'Tuval' },
    locationCity: null,
    owner: 'artist',
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
    technique: { en: 'Oil', tr: 'Yağlıboya' },
    material: null,
    locationCity: null,
    owner: 'private_eu',
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
    technique: { en: 'Watercolor', tr: 'Suluboya' },
    material: { en: 'Paper', tr: 'Kağıt' },
    locationCity: null,
    owner: 'artist',
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

  it('filters by multiple dimensions simultaneously', () => {
    const filters: PaintingFilters = {
      ...EMPTY_FILTERS,
      techniqueIds: ['oil'],
      materialIds: ['canvas'],
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

// The frontend holds no list of techniques or materials — filter options are
// derived from whatever the loaded paintings actually use.
describe('extractLookupOptions', () => {
  it('derives options from the paintings, labelled in English', () => {
    // Two of the three fixtures share 'oil', so it appears once.
    const options = extractLookupOptions(mockPaintings, 'techniqueId', 'technique', 'en');
    expect(options).toEqual([
      { id: 'oil', label: 'Oil' },
      { id: 'watercolor', label: 'Watercolor' },
    ]);
  });

  it('labels the same options in Turkish', () => {
    const options = extractLookupOptions(mockPaintings, 'techniqueId', 'technique', 'tr');
    expect(options.map((o) => o.label)).toEqual(['Suluboya', 'Yağlıboya']);
  });

  it('deduplicates ids and skips paintings without the lookup', () => {
    const paintings: Painting[] = [
      mockPaintings[0],
      { ...mockPaintings[1], techniqueId: 'oil', technique: { en: 'Oil', tr: 'Yağlıboya' } },
      { ...mockPaintings[2], techniqueId: null, technique: null },
    ];
    const options = extractLookupOptions(paintings, 'techniqueId', 'technique', 'en');
    expect(options).toEqual([{ id: 'oil', label: 'Oil' }]);
  });

  it('sorts with Turkish collation, not raw code points', () => {
    const paintings: Painting[] = [
      { ...mockPaintings[0], techniqueId: 'z', technique: { en: 'Z', tr: 'Zamk' } },
      { ...mockPaintings[1], techniqueId: 'c', technique: { en: 'C', tr: 'Çini' } },
      { ...mockPaintings[2], techniqueId: 'd', technique: { en: 'D', tr: 'Duralit' } },
    ];
    // In Turkish, Ç sorts right after C — ahead of D — rather than after Z
    // where its code point would put it.
    const options = extractLookupOptions(paintings, 'techniqueId', 'technique', 'tr');
    expect(options.map((o) => o.label)).toEqual(['Çini', 'Duralit', 'Zamk']);
  });
});
