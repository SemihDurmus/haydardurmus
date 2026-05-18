import type { ImageAsset, TranslatedText } from '@shared/types';

export type MediaType = 'video' | 'interview' | 'press' | 'exhibition';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: TranslatedText;
  description: TranslatedText | null;
  date: string; // ISO 8601
  source: string;
  url: string;
  thumbnail: ImageAsset | null;
  embedId: string | null;    // YouTube/Vimeo ID
  venue: string | null;      // Exhibition venue
  city: string | null;       // Exhibition city
  language: 'en' | 'tr' | null; // For press/interviews
}

export const mockMedia: MediaItem[] = [
  {
    id: 'm001',
    type: 'press',
    title: {
      en: 'Form and Silence: The Paintings of Haydar Durmuş',
      tr: 'Form ve Sessizlik: Haydar Durmuş\'un Resimleri',
    },
    description: {
      en: 'An in-depth review of the recent exhibition at Galeri X.',
      tr: 'Galeri X\'teki son serginin derinlemesine bir incelemesi.',
    },
    date: '2023-11-10',
    source: 'Sanat Dünyası',
    url: '#',
    thumbnail: null,
    embedId: null,
    venue: null,
    city: null,
    language: 'tr',
  },
  {
    id: 'm002',
    type: 'exhibition',
    title: { en: 'Threshold — Solo Exhibition', tr: 'Eşik — Kişisel Sergi' },
    description: {
      en: 'A solo exhibition presenting works from the Threshold series.',
      tr: 'Eşik serisinden eserlerin sunulduğu kişisel sergi.',
    },
    date: '2022-05-15',
    source: 'Galeri Apel',
    url: '#',
    thumbnail: null,
    embedId: null,
    venue: 'Galeri Apel',
    city: 'Istanbul',
    language: null,
  },
  {
    id: 'm003',
    type: 'interview',
    title: {
      en: 'Conversation with Haydar Durmuş',
      tr: 'Haydar Durmuş ile Söyleşi',
    },
    description: {
      en: 'A wide-ranging conversation about process, memory, and the role of color.',
      tr: 'Süreç, bellek ve rengin rolü üzerine kapsamlı bir söyleşi.',
    },
    date: '2022-09-01',
    source: 'Artı Sanat',
    url: '#',
    thumbnail: null,
    embedId: null,
    venue: null,
    city: null,
    language: 'tr',
  },
  {
    id: 'm004',
    type: 'video',
    title: {
      en: 'Studio Visit: Haydar Durmuş',
      tr: 'Atölye Ziyareti: Haydar Durmuş',
    },
    description: {
      en: 'A documentary visit to the artist\'s Istanbul studio.',
      tr: 'Sanatçının İstanbul atölyesine belgesel bir ziyaret.',
    },
    date: '2021-12-01',
    source: 'YouTube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: null,
    embedId: 'dQw4w9WgXcQ',
    venue: null,
    city: null,
    language: 'tr',
  },
];
