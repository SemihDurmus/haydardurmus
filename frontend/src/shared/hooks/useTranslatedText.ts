import { useTranslation } from 'react-i18next';
import type { TranslatedText, SupportedLocale } from '@shared/types';

/**
 * Pick the current locale's string out of a bilingual value.
 *
 * Falls back to English when the locale is missing or empty — a record that
 * has only been filled in on one side still renders something rather than a
 * blank. Null in, null out, so optional fields can be passed straight through.
 *
 * This is the plain function; prefer the hook below inside components. It
 * exists separately because hooks can't be called conditionally, and most
 * translated fields coming from the API are nullable.
 */
export function pickTranslated(
  text: TranslatedText | null | undefined,
  locale: SupportedLocale,
): string | null {
  if (!text) return null;
  return text[locale] || text.en || null;
}

/**
 * Extract the current locale's value from a TranslatedText field.
 * Falls back to English if the current locale is not available.
 */
export function useTranslatedText(text: TranslatedText): string {
  const { i18n } = useTranslation();
  const locale = (i18n.language?.split('-')[0] ?? 'en') as SupportedLocale;
  return pickTranslated(text, locale) ?? '';
}
