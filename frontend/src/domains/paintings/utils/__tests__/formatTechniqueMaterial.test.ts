import { formatTechniqueMaterial } from '../formatTechniqueMaterial';

describe('formatTechniqueMaterial', () => {
  it('combines technique and material in English, material lowercased', () => {
    expect(formatTechniqueMaterial('Oil', 'Wood Panel', 'en')).toBe('Oil on wood panel');
    expect(formatTechniqueMaterial('Collage', 'Cardboard', 'en')).toBe('Collage on cardboard');
  });

  it('combines technique and material in Turkish, technique lowercased', () => {
    expect(formatTechniqueMaterial('Yağlıboya', 'Ahşap Panel', 'tr')).toBe(
      'Ahşap Panel üzerine yağlıboya'
    );
    expect(formatTechniqueMaterial('Kolaj', 'Karton', 'tr')).toBe('Karton üzerine kolaj');
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
