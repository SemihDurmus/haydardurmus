import {
  countActiveFilters,
  isFiltersEmpty,
  parseFiltersFromParams,
  serializeFiltersToParams,
  resolveLookupOptions,
} from '../filters';
import { EMPTY_FILTERS } from '../../types';
import type { PaintingFilters, PaintingFilterOptions } from '../../types';

const mockLookupOptions: PaintingFilterOptions['techniques'] = [
  { id: 'oil', label: { en: 'Oil', tr: 'Yağlıboya' } },
  { id: 'watercolor', label: { en: 'Watercolor', tr: 'Suluboya' } },
];

describe('countActiveFilters', () => {
  it('returns 0 for empty filters', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  });

  it('counts each active dimension', () => {
    const filters: PaintingFilters = {
      ...EMPTY_FILTERS,
      yearMin: 2023,
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
    expect(isFiltersEmpty({ ...EMPTY_FILTERS, yearMin: 2023 })).toBe(false);
  });
});

describe('parseFiltersFromParams / serializeFiltersToParams', () => {
  it('round-trips filters through URL params', () => {
    const original: PaintingFilters = {
      ...EMPTY_FILTERS,
      search: 'test',
      yearMin: 2022,
      yearMax: 2023,
      techniqueIds: ['oil', 'acrylic'],
    };

    const params = serializeFiltersToParams(original);
    const parsed = parseFiltersFromParams(params);

    expect(parsed.search).toBe('test');
    expect(parsed.yearMin).toBe(2022);
    expect(parsed.yearMax).toBe(2023);
    expect(parsed.techniqueIds).toEqual(['oil', 'acrylic']);
  });

  it('produces empty filters from empty params', () => {
    const params = new URLSearchParams();
    const parsed = parseFiltersFromParams(params);
    expect(isFiltersEmpty(parsed)).toBe(true);
  });

  it('ignores invalid number values', () => {
    const params = new URLSearchParams('y_min=notanumber&y_max=2023');
    const parsed = parseFiltersFromParams(params);
    expect(parsed.yearMin).toBeNull();
    expect(parsed.yearMax).toBe(2023);
  });
});

// The frontend holds no hardcoded list of techniques or materials — options
// come from the backend's filter-options facet endpoint (every painting, not
// just a loaded page), resolved here to the active locale's label.
describe('resolveLookupOptions', () => {
  it('resolves labels in English, sorted', () => {
    const options = resolveLookupOptions(mockLookupOptions, 'en');
    expect(options).toEqual([
      { id: 'oil', label: 'Oil' },
      { id: 'watercolor', label: 'Watercolor' },
    ]);
  });

  it('resolves labels in Turkish, sorted', () => {
    const options = resolveLookupOptions(mockLookupOptions, 'tr');
    expect(options.map((o) => o.label)).toEqual(['Suluboya', 'Yağlıboya']);
  });

  it('sorts with Turkish collation, not raw code points', () => {
    const options: PaintingFilterOptions['techniques'] = [
      { id: 'z', label: { en: 'Z', tr: 'Zamk' } },
      { id: 'c', label: { en: 'C', tr: 'Çini' } },
      { id: 'd', label: { en: 'D', tr: 'Duralit' } },
    ];
    // In Turkish, Ç sorts right after C — ahead of D — rather than after Z
    // where its code point would put it.
    expect(resolveLookupOptions(options, 'tr').map((o) => o.label)).toEqual([
      'Çini',
      'Duralit',
      'Zamk',
    ]);
  });
});
