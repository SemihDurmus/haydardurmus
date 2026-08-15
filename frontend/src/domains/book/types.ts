import type { ImageAsset, TranslatedText } from '@shared/types';
import bookCover from '@assets/bookCover.png';

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
  title: { en: 'Ressam Haydar Durmuş', tr: 'Ressam Haydar Durmuş' },
  subtitle: null,
  description: {
    en: "Compiled by Doç. Dr. Özge Adıgüzel Ömür, this book brings together Haydar Durmuş's life story along with accounts from his students, colleagues, and fellow artists who knew him closely.",
    tr: 'Doç. Dr. Özge Adıgüzel Ömür tarafından derlenen bu kitap, Haydar Durmuş\'un yaşam öyküsünü; öğrencilerinin, meslektaşlarının ve onu yakından tanıyan sanatçı dostlarının anlatımlarıyla bir araya getiriyor.',
  },
  coverImage: { src: bookCover, alt: 'Book cover — Ressam Haydar Durmuş' },
  publishYear: 2026,
  publisher: 'Eflatun Kitaplar',
  isbn: '9786259019062',
  pageCount: 220,
  purchaseLinks: [
    {
      label: 'Kitapyurdu',
      url: 'https://www.kitapyurdu.com/kitap/ressam-haydar-durmus/755384.html',
      type: 'other',
    },
    {
      label: 'e-kitap',
      url: 'https://www.e-kitapmedia.de/urun/ressam-haydar-durmus-kolektif-9786259019062',
      type: 'other',
    },
    {
      label: '1000 Kitap',
      url: 'https://1000kitap.com/kitap/ressam-haydar-durmus--539510',
      type: 'other',
    },
  ],
  previewImages: [],
};
