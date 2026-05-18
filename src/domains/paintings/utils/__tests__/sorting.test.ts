import { applySorting, parseSortFromParam } from '../sorting';
import { DEFAULT_SORT } from '../../types';
import type { Painting } from '../../types';

const paintings: Painting[] = [
  { id: 'p1', paintingNo: 'HD-003', paintingName: 'Zephyr', width: 50, height: 60, radius: null, artistId: 'a1', year: 2020, techniqueId: null, materialId: null, locationCityId: null, ownerId: null },
  { id: 'p2', paintingNo: 'HD-001', paintingName: 'Alpha', width: 100, height: 120, radius: null, artistId: 'a1', year: 2023, techniqueId: null, materialId: null, locationCityId: null, ownerId: null },
  { id: 'p3', paintingNo: 'HD-002', paintingName: null, width: 20, height: 30, radius: null, artistId: 'a1', year: 2021, techniqueId: null, materialId: null, locationCityId: null, ownerId: null },
  { id: 'p4', paintingNo: 'HD-004', paintingName: 'Midnight', width: null, height: null, radius: 40, artistId: 'a1', year: null, techniqueId: null, materialId: null, locationCityId: null, ownerId: null },
];

describe('applySorting', () => {
  it('does not mutate the original array', () => {
    const original = [...paintings];
    applySorting(paintings, 'year_desc');
    expect(paintings).toEqual(original);
  });

  it('sorts by year descending (newest first)', () => {
    const result = applySorting(paintings, 'year_desc');
    expect(result[0].year).toBe(2023);
    expect(result[1].year).toBe(2021);
    expect(result[2].year).toBe(2020);
    // null year goes last
    expect(result[3].year).toBeNull();
  });

  it('sorts by year ascending (oldest first)', () => {
    const result = applySorting(paintings, 'year_asc');
    expect(result[0].year).toBe(2020);
    expect(result[1].year).toBe(2021);
    expect(result[2].year).toBe(2023);
    expect(result[3].year).toBeNull();
  });

  it('sorts by painting number ascending', () => {
    const result = applySorting(paintings, 'no_asc');
    expect(result[0].paintingNo).toBe('HD-001');
    expect(result[1].paintingNo).toBe('HD-002');
    expect(result[2].paintingNo).toBe('HD-003');
    expect(result[3].paintingNo).toBe('HD-004');
  });

  it('sorts by painting number descending', () => {
    const result = applySorting(paintings, 'no_desc');
    expect(result[0].paintingNo).toBe('HD-004');
    expect(result[3].paintingNo).toBe('HD-001');
  });

  it('sorts by name ascending (null name treated as empty string, sorts first)', () => {
    const result = applySorting(paintings, 'name_asc');
    // null paintingName becomes '' which sorts before any letter
    expect(result[0].paintingName).toBeNull();   // '' < 'Alpha'
    expect(result[1].paintingName).toBe('Alpha');
    expect(result[2].paintingName).toBe('Midnight');
    expect(result[3].paintingName).toBe('Zephyr');
  });

  it('sorts by size descending (largest area first)', () => {
    const result = applySorting(paintings, 'size_desc');
    // p2: 100×120 = 12000
    // p1: 50×60 = 3000
    // p3: 20×30 = 600
    // p4: π×40² ≈ 5027 (radius)
    expect(result[0].id).toBe('p2'); // 12000
    expect(result[1].id).toBe('p4'); // ~5027
    expect(result[2].id).toBe('p1'); // 3000
    expect(result[3].id).toBe('p3'); // 600
  });

  it('sorts by size ascending (smallest area first)', () => {
    const result = applySorting(paintings, 'size_asc');
    expect(result[0].id).toBe('p3');
    expect(result[3].id).toBe('p2');
  });
});

describe('parseSortFromParam', () => {
  it('returns the param value when valid', () => {
    expect(parseSortFromParam('year_asc', DEFAULT_SORT)).toBe('year_asc');
  });

  it('returns default sort for invalid values', () => {
    expect(parseSortFromParam('invalid', DEFAULT_SORT)).toBe(DEFAULT_SORT);
  });

  it('returns default sort for null', () => {
    expect(parseSortFromParam(null, DEFAULT_SORT)).toBe(DEFAULT_SORT);
  });
});
