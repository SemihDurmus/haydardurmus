import type { ImageAsset, TranslatedText } from '@shared/types';

export interface Collection {
  id: string;
  slug: string;
  title: TranslatedText;
  description: TranslatedText;
  coverImage: ImageAsset;
  /**
   * Painting numbers (painting_no) of the works in this collection.
   * Identifiers only — the painting records themselves come from the API.
   * No painting data is stored in the frontend.
   */
  paintingNos: string[];
  year: number | null;
  isPublished: boolean;
}

export const mockCollections: Collection[] = [
  {
    id: 'c001',
    slug: 'forma-series',
    title: { en: 'Forma Series', tr: 'Forma Serisi' },
    description: {
      en: 'A series of circular works exploring form, light, and the boundaries of the canvas.',
      tr: 'Formayı, ışığı ve tuvalin sınırlarını araştıran dairesel eserler serisi.',
    },
    coverImage: { src: '', alt: 'Forma Series' },
    paintingNos: ['2638', '2647'],
    year: 2021,
    isPublished: true,
  },
  {
    id: 'c002',
    slug: 'threshold',
    title: { en: 'Threshold', tr: 'Eşik' },
    description: {
      en: 'Large-scale works investigating the threshold between presence and absence.',
      tr: 'Varlık ve yokluk arasındaki eşiği araştıran büyük ölçekli eserler.',
    },
    coverImage: { src: '', alt: 'Threshold Collection' },
    paintingNos: ['2418', '2399', '1911'],
    year: 2020,
    isPublished: true,
  },
  {
    id: 'c003',
    slug: 'early-works',
    title: { en: 'Early Works', tr: 'Erken Dönem Çalışmalar' },
    description: {
      en: 'Works from the formative years, documenting the development of a visual language.',
      tr: 'Görsel bir dilin gelişimini belgeleyen, oluşum yıllarından eserler.',
    },
    coverImage: { src: '', alt: 'Early Works Collection' },
    paintingNos: ['p015', 'p016', 'p018', 'p019', 'p020'],
    year: 2014,
    isPublished: true,
  },
];
