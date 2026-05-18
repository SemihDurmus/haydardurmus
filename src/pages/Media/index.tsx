import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Play } from 'lucide-react';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { mockMedia, type MediaItem, type MediaType } from '@domains/media/types';
import { cn } from '@shared/utils/cn';
import type { SupportedLocale } from '@shared/types';

type TabFilter = 'all' | MediaType;

const TABS: { value: TabFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'tabs.all' },
  { value: 'press', labelKey: 'tabs.press' },
  { value: 'interview', labelKey: 'tabs.interviews' },
  { value: 'exhibition', labelKey: 'tabs.exhibitions' },
  { value: 'video', labelKey: 'tabs.videos' },
];

function MediaCard({ item, locale }: { item: MediaItem; locale: SupportedLocale }) {
  const { t } = useTranslation('media');

  const title = item.title[locale] ?? item.title.en;
  const description = item.description ? (item.description[locale] ?? item.description.en) : null;

  const date = new Date(item.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  const ctaLabel =
    item.type === 'video'
      ? t('card.watchVideo')
      : item.type === 'exhibition'
      ? t('card.viewExhibition')
      : t('card.readMore');

  return (
    <article className="group border-b border-border py-7 last:border-0">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="font-sans text-label uppercase tracking-widest text-accent">
              {item.type}
            </span>
            <span className="text-text-tertiary" aria-hidden>·</span>
            <span className="font-sans text-body-sm text-text-tertiary">{item.source}</span>
            <span className="text-text-tertiary" aria-hidden>·</span>
            <time className="font-sans text-body-sm text-text-tertiary" dateTime={item.date}>
              {date}
            </time>
          </div>

          <Typography level="h4" className="mb-2 transition-colors group-hover:text-accent">
            {title}
          </Typography>

          {description && (
            <Typography level="body-sm" tone="secondary" className="line-clamp-2">
              {description}
            </Typography>
          )}

          {item.venue && (
            <Typography level="body-sm" tone="tertiary" className="mt-1">
              {item.venue}{item.city ? `, ${item.city}` : ''}
            </Typography>
          )}
        </div>

        {item.url && item.url !== '#' && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex shrink-0 items-center gap-1.5 font-sans text-body-sm text-text-secondary transition-colors hover:text-text-primary"
            aria-label={`${ctaLabel}: ${title}`}
          >
            {item.type === 'video' ? (
              <Play className="h-3.5 w-3.5" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            {ctaLabel}
          </a>
        )}
      </div>
    </article>
  );
}

export default function MediaPage() {
  const { t, i18n } = useTranslation('media');
  const locale = (i18n.language?.split('-')[0] ?? 'en') as SupportedLocale;
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filtered =
    activeTab === 'all' ? mockMedia : mockMedia.filter((m) => m.type === activeTab);

  return (
    <Section spacing="lg" background="default">
      <Container width="default">
        <div className="mb-10">
          <Typography level="overline" tone="tertiary" className="mb-2 block">
            {t('page.subtitle')}
          </Typography>
          <Typography level="h1">{t('page.title')}</Typography>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-1 border-b border-border pb-0">
          {TABS.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={cn(
                'border-b-2 px-4 pb-3 pt-1 font-sans text-body-sm transition-colors',
                activeTab === value
                  ? 'border-primary-900 text-text-primary'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary'
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* Media items */}
        {filtered.length === 0 ? (
          <Typography level="body" tone="tertiary">
            No items in this category.
          </Typography>
        ) : (
          <div>
            {filtered.map((item) => (
              <MediaCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
