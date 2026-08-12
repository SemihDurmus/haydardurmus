import type { PaintingTechnique, PaintingMaterial, PaintingCity, PaintingOwner } from '../types';

export const techniques: PaintingTechnique[] = [
  { id: 'oil', label: 'Oil', labelTr: 'Yağlıboya' },
  { id: 'acrylic', label: 'Acrylic', labelTr: 'Akrilik' },
  { id: 'watercolor', label: 'Watercolor', labelTr: 'Suluboya' },
  { id: 'mixed', label: 'Mixed Media', labelTr: 'Karma Teknik' },
  { id: 'pastel', label: 'Pastel', labelTr: 'Pastel' },
  { id: 'charcoal', label: 'Charcoal', labelTr: 'Karakalem' },
  { id: 'collage', label: 'Collage', labelTr: 'Kolaj' },
];

export const materials: PaintingMaterial[] = [
  { id: 'canvas', label: 'Canvas', labelTr: 'Tuval' },
  { id: 'canvasPanel', label: 'Canvas Panel', labelTr: 'Pres Tuval' },
  { id: 'paper', label: 'Paper', labelTr: 'Kağıt' },
  { id: 'wood', label: 'Wood Panel', labelTr: 'Ahşap Panel' },
  { id: 'plywood', label: 'Plywood', labelTr: 'Kontrplak' },
  { id: 'cardboard', label: 'Cardboard', labelTr: 'Karton' },
  { id: 'pvcFoamBoard', label: 'PVC Foam Board', labelTr: 'Duralit' },
];

export const cities: PaintingCity[] = [
  { id: 'istanbul', label: 'Istanbul', labelTr: 'İstanbul' },
  { id: 'ankara', label: 'Ankara', labelTr: 'Ankara' },
  { id: 'izmir', label: 'Izmir', labelTr: 'İzmir' },
  { id: 'paris', label: 'Paris', labelTr: 'Paris' },
  { id: 'berlin', label: 'Berlin', labelTr: 'Berlin' },
  { id: 'london', label: 'London', labelTr: 'Londra' },
  { id: 'new_york', label: 'New York', labelTr: 'New York' },
  { id: 'private', label: 'Private Collection', labelTr: 'Özel Koleksiyon' },
];

export const owners: PaintingOwner[] = [
  { id: 'artist', label: "Artist's Collection", labelTr: 'Sanatçı Koleksiyonu' },
  { id: 'private_tr', label: 'Private Collection (Turkey)', labelTr: 'Özel Koleksiyon (Türkiye)' },
  { id: 'private_eu', label: 'Private Collection (Europe)', labelTr: 'Özel Koleksiyon (Avrupa)' },
  { id: 'museum', label: 'Museum Collection', labelTr: 'Müze Koleksiyonu' },
  { id: 'gallery', label: 'Gallery Collection', labelTr: 'Galeri Koleksiyonu' },
];

/** Helper — get lookup label by ID */
export function getLookupLabel(
  items: PaintingTechnique[] | PaintingMaterial[] | PaintingCity[] | PaintingOwner[],
  id: string | null,
  locale: 'en' | 'tr' = 'en'
): string | null {
  if (!id) return null;
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  return locale === 'tr' && item.labelTr ? item.labelTr : item.label;
}
