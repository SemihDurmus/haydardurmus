import { formatTechniqueMaterial } from '../formatTechniqueMaterial';

describe('formatTechniqueMaterial', () => {
  it('combines technique and material in English', () => {
    expect(formatTechniqueMaterial('Oil', 'Wood Panel', 'en')).toBe('Oil on Wood Panel');
    expect(formatTechniqueMaterial('Collage', 'Cardboard', 'en')).toBe('Collage on Cardboard');
  });

  it('combines technique and material in Turkish', () => {
    expect(formatTechniqueMaterial('Yağlıboya', 'Ahşap Panel', 'tr')).toBe(
      'Ahşap Panel üzerine Yağlıboya'
    );
    expect(formatTechniqueMaterial('Kolaj', 'Karton', 'tr')).toBe('Karton üzerine Kolaj');
  });

  it('returns technique only when material is missing', () => {
    expect(formatTechniqueMaterial('Oil', null, 'en')).toBe('Oil');
    expect(formatTechniqueMaterial('Yağlıboya', null, 'tr')).toBe('Yağlıboya');
  });

  it('returns material only when technique is missing', () => {
    expect(formatTechniqueMaterial(null, 'Canvas', 'en')).toBe('On canvas');
    expect(formatTechniqueMaterial(null, 'Tuval', 'tr')).toBe('Tuval üzerine');
  });

  it('returns null when both are missing', () => {
    expect(formatTechniqueMaterial(null, null, 'en')).toBeNull();
  });
});
