import type { ImageAsset, TranslatedText } from '@shared/types';

export type PurchaseLinkType = 'amazon' | 'official' | 'publisher' | 'other';

export interface PurchaseLink {
  label: string;
  url: string;
  type: PurchaseLinkType;
}

export interface Book {
  id: string;
  title: TranslatedText;
  subtitle: TranslatedText | null;
  description: TranslatedText;
  coverImage: ImageAsset;
  publishYear: number;
  publisher: string;
  isbn: string | null;
  pageCount: number | null;
  purchaseLinks: PurchaseLink[];
  previewImages: ImageAsset[];
}

export const mockBook: Book = {
  id: 'b001',
  title: { en: 'Haydar Durmuş: Works 2012–2023', tr: 'Haydar Durmuş: 2012–2023 Çalışmaları' },
  subtitle: {
    en: 'A Monograph',
    tr: 'Bir Monografi',
  },
  description: {
    en: 'A comprehensive monograph documenting over a decade of painting practice. With essays by leading art critics and full-page reproductions of over 80 works.',
    tr: 'On yılı aşkın bir resim pratiğini belgeleyen kapsamlı bir monografi. Önde gelen sanat eleştirmenlerinin denemeleri ve 80\'den fazla eserin tam sayfa yeniden üretimleriyle.',
  },
  coverImage: { src: '', alt: 'Book cover — Haydar Durmuş: Works 2012–2023' },
  publishYear: 2024,
  publisher: 'YKY / Yapı Kredi Yayınları',
  isbn: '978-975-08-5XXX-X',
  pageCount: 240,
  purchaseLinks: [
    {
      label: 'Order on Amazon',
      url: 'https://amazon.com',
      type: 'amazon',
    },
    {
      label: 'YKY Official Store',
      url: 'https://ykykultur.com.tr',
      type: 'publisher',
    },
  ],
  previewImages: [],
};
