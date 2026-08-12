import { useTranslation } from 'react-i18next';
import { cn } from '@shared/utils/cn';
import type { SupportedLocale } from '@shared/types';

const LOCALES: { code: SupportedLocale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'inline' | 'dropdown';
}

export function LanguageSwitcher({ className, variant = 'inline' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] as SupportedLocale;

  const handleChange = (locale: SupportedLocale) => {
    void i18n.changeLanguage(locale);
  };

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1', className)} role="group" aria-label="Language switcher">
        {LOCALES.map(({ code, label }, idx) => (
          <span key={code} className="flex items-center">
            {idx > 0 && (
              <span className="mx-1 text-border" aria-hidden>
                /
              </span>
            )}
            <button
              onClick={() => handleChange(code)}
              className={cn(
                'font-sans text-label uppercase tracking-widest transition-colors',
                currentLang === code
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
              aria-current={currentLang === code ? 'true' : undefined}
              aria-label={`Switch to ${code === 'en' ? 'English' : 'Türkçe'}`}
            >
              {label}
            </button>
          </span>
        ))}
      </div>
    );
  }

  return null; // Dropdown variant — implement when needed
}
