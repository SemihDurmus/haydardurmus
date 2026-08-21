import { getPaginationRange } from '../pagination';

describe('getPaginationRange', () => {
  it('returns an empty array when there are no pages', () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
  });

  it('returns all pages when the total is small enough that no gap forms', () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(5, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses a gap after the current page window near the start', () => {
    expect(getPaginationRange(1, 9)).toEqual([1, 2, 'ellipsis', 9]);
  });

  it('collapses a gap before the current page window near the end', () => {
    expect(getPaginationRange(9, 9)).toEqual([1, 'ellipsis', 8, 9]);
  });

  it('collapses gaps on both sides when the current page is in the middle', () => {
    expect(getPaginationRange(5, 9)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 9]);
  });

  it('shows a page number instead of an ellipsis for a single-page gap', () => {
    // gap of exactly one page (page 3) between 1..2 window and 4..9 — no ellipsis needed
    expect(getPaginationRange(4, 9)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 9]);
  });

  it('handles a single page', () => {
    expect(getPaginationRange(1, 1)).toEqual([1]);
  });
});
