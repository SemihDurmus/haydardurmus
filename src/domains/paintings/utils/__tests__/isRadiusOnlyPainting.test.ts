import { isRadiusOnlyPainting } from '../isRadiusOnlyPainting';

describe('isRadiusOnlyPainting', () => {
  it('returns true when only radius is set', () => {
    expect(isRadiusOnlyPainting({ width: null, height: null, radius: 39 })).toBe(true);
  });

  it('returns false when width and height are set', () => {
    expect(isRadiusOnlyPainting({ width: 50, height: 60, radius: null })).toBe(false);
  });

  it('returns false when all dimensions are null', () => {
    expect(isRadiusOnlyPainting({ width: null, height: null, radius: null })).toBe(false);
  });

  it('returns false when radius is set alongside width or height', () => {
    expect(isRadiusOnlyPainting({ width: 50, height: null, radius: 39 })).toBe(false);
  });
});
