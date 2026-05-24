import {
  formatDimensions,
  getPaintingArea,
  formatYear,
  truncate,
  getPaintingDisplayName,
} from '../format';

describe('formatDimensions', () => {
  it('formats width × height', () => {
    expect(formatDimensions(80, 100, null)).toBe('80 × 100 cm');
  });

  it('formats circular works by radius', () => {
    expect(formatDimensions(null, null, 50)).toBe('⌀50 cm');
  });

  it('returns width only when height is null', () => {
    expect(formatDimensions(80, null, null)).toBe('80 cm (w)');
  });

  it('returns height only when width is null', () => {
    expect(formatDimensions(null, 100, null)).toBe('100 cm (h)');
  });

  it('returns fallback when all dimensions are null', () => {
    expect(formatDimensions(null, null, null)).toBe('—');
  });

  it('radius takes precedence over width/height', () => {
    expect(formatDimensions(80, 100, 50)).toBe('⌀50 cm');
  });
});

describe('getPaintingArea', () => {
  it('calculates rectangular area', () => {
    expect(getPaintingArea(80, 100, null)).toBe(8000);
  });

  it('calculates circular area', () => {
    const area = getPaintingArea(null, null, 10);
    expect(area).toBeCloseTo(Math.PI * 100, 5);
  });

  it('returns 0 when dimensions are null', () => {
    expect(getPaintingArea(null, null, null)).toBe(0);
  });
});

describe('formatYear', () => {
  it('formats a year number as string', () => {
    expect(formatYear(2023)).toBe('2023');
  });

  it('returns default fallback for null', () => {
    expect(formatYear(null)).toBe('Unknown');
  });

  it('uses custom fallback', () => {
    expect(formatYear(null, '—')).toBe('—');
  });
});

describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates long strings with ellipsis', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('handles exact length strings', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('getPaintingDisplayName', () => {
  it('returns painting name when available', () => {
    expect(getPaintingDisplayName('Morning Light')).toBe('Morning Light');
  });

  it('returns fallback when name is null', () => {
    expect(getPaintingDisplayName(null)).toBe('Untitled');
  });

  it('uses custom fallback', () => {
    expect(getPaintingDisplayName(null, 'İsimsiz')).toBe('İsimsiz');
  });
});
