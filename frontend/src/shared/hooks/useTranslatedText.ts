import { useTranslation } from 'react-i18next';
import type { TranslatedText, SupportedLocale } from '@shared/types';

/**
 * Extract the current locale's value from a TranslatedText field.
 * Falls back to English if the current locale is not available.
 */
export function useTranslatedText(text: TranslatedText): string {
  const { i18n } = useTranslation();
  const locale = (i18n.language?.split('-')[0] ?? 'en') as SupportedLocale;
  return text[locale] ?? text['en'];
}
