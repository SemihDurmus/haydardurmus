import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English
import enCommon from '../locales/en/common.json';
import enPaintings from '../locales/en/paintings.json';
import enBiography from '../locales/en/biography.json';
import enHome from '../locales/en/home.json';
import enMedia from '../locales/en/media.json';
import enBook from '../locales/en/book.json';
import enContact from '../locales/en/contact.json';
import enCollections from '../locales/en/collections.json';

// Turkish
import trCommon from '../locales/tr/common.json';
import trPaintings from '../locales/tr/paintings.json';
import trBiography from '../locales/tr/biography.json';
import trHome from '../locales/tr/home.json';
import trMedia from '../locales/tr/media.json';
import trBook from '../locales/tr/book.json';
import trContact from '../locales/tr/contact.json';
import trCollections from '../locales/tr/collections.json';

export const defaultNS = 'common';
export const supportedLocales = ['en', 'tr'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        paintings: enPaintings,
        biography: enBiography,
        home: enHome,
        media: enMedia,
        book: enBook,
        contact: enContact,
        collections: enCollections,
      },
      tr: {
        common: trCommon,
        paintings: trPaintings,
        biography: trBiography,
        home: trHome,
        media: trMedia,
        book: trBook,
        contact: trContact,
        collections: trCollections,
      },
    },

    defaultNS,
    fallbackLng: 'en',
    supportedLngs: supportedLocales,
    interpolation: {
      escapeValue: false, // React handles XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'haydardurmus_lang',
    },
  });

export default i18n;
