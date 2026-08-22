import { parseSortFromParam } from '../sorting';
import { DEFAULT_SORT } from '../../types';

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
