import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { Button } from '@shared/ui/Button';
import { mockBook } from '@domains/book/types';
import type { SupportedLocale } from '@shared/types';

export default function BookPage() {
  const { t, i18n } = useTranslation('book');
  const locale = (i18n.language?.split('-')[0] ?? 'en') as SupportedLocale;

  const title = mockBook.title[locale] ?? mockBook.title.en;
  const subtitle = mockBook.subtitle ? (mockBook.subtitle[locale] ?? mockBook.subtitle.en) : null;
  const description = mockBook.description[locale] ?? mockBook.description.en;

  const bookDetails = [
    { label: t('details.publisher'), value: mockBook.publisher },
    { label: t('details.year'), value: mockBook.publishYear },
    { label: t('details.pages'), value: mockBook.pageCount },
    { label: t('details.isbn'), value: mockBook.isbn },
  ].filter((item) => item.value);

  return (
    <>
      <Section spacing="lg" background="default">
        <Container width="wide">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Cover */}
            <div className="flex items-start justify-center lg:justify-start">
              <div className="w-full max-w-sm overflow-hidden bg-muted">
                {mockBook.coverImage.src ? (
                  <img
                    src={mockBook.coverImage.src}
                    alt={mockBook.coverImage.alt}
                    className="w-full"
                  />
                ) : (
                  <div className="flex aspect-[3/4] flex-col items-center justify-center gap-4 p-8 text-center">
                    <Typography level="h3" tone="secondary">{title}</Typography>
                    {subtitle && (
                      <Typography level="body-sm" tone="tertiary">{subtitle}</Typography>
                    )}
                    <Typography level="caption" tone="tertiary">{mockBook.publisher}</Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <Typography level="overline" tone="tertiary" className="mb-3 block">
                {t('page.subtitle')}
              </Typography>
              <Typography level="h1" className="mb-2">{title}</Typography>
              {subtitle && (
                <Typography level="h3" tone="secondary" className="mb-8">{subtitle}</Typography>
              )}

              <Typography level="body-lg" tone="secondary" className="mb-8 text-pretty">
                {description}
              </Typography>

              {/* Metadata */}
              <dl className="mb-10 space-y-3 border-t border-border pt-6">
                {bookDetails.map(({ label, value }) => (
                  <div key={label} className="flex gap-4">
                    <dt className="w-28 shrink-0 font-sans text-body-sm text-text-tertiary">{label}</dt>
                    <dd className="font-sans text-body-sm">{value}</dd>
                  </div>
                ))}
              </dl>

              {/* Purchase links */}
              {mockBook.purchaseLinks.length > 0 && (
                <div>
                  <Typography level="overline" tone="tertiary" className="mb-4 block">
                    {t('purchase.title')}
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    {mockBook.purchaseLinks.map((link) => (
                      <Button
                        key={link.type}
                        as="a"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary"
                        size="md"
                      >
                        {link.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
