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
import enAdmin from '../locales/en/admin.json';

// Turkish
import trCommon from '../locales/tr/common.json';
import trPaintings from '../locales/tr/paintings.json';
import trBiography from '../locales/tr/biography.json';
import trHome from '../locales/tr/home.json';
import trMedia from '../locales/tr/media.json';
import trBook from '../locales/tr/book.json';
import trContact from '../locales/tr/contact.json';
import trCollections from '../locales/tr/collections.json';
import trAdmin from '../locales/tr/admin.json';

export const defaultNS = 'common';
export const supportedLocales = ['en', 'tr'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

/** Sync <html lang> so CSS text-transform: uppercase uses locale-aware rules (e.g. tr: i → İ). */
export function syncDocumentLang(language: string | undefined) {
  const base = language?.split('-')[0] ?? 'en';
  document.documentElement.lang = supportedLocales.includes(base as SupportedLocale)
    ? base
    : 'en';
}

i18n.on('initialized', () => {
  syncDocumentLang(i18n.resolvedLanguage ?? i18n.language);
});

i18n.on('languageChanged', (lng) => {
  syncDocumentLang(lng);
});

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
        admin: enAdmin,
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
        admin: trAdmin,
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

if (i18n.isInitialized) {
  syncDocumentLang(i18n.resolvedLanguage ?? i18n.language);
}

export default i18n;
