import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { artistBiography } from '@domains/biography/types';
import { useTranslatedText } from '@shared/hooks/useTranslatedText';

export default function BiographyPage() {
  const { t } = useTranslation('biography');
  const fullBio = useTranslatedText(artistBiography.fullBio);
  const nationality = useTranslatedText(artistBiography.nationality);
  const livesAndWorks = useTranslatedText(artistBiography.livesAndWorks);

  return (
    <>
      {/* Hero */}
      <Section spacing="lg" background="default">
        <Container width="narrow">
          <Typography level="overline" tone="tertiary" className="mb-4 block">
            {t('page.subtitle')}
          </Typography>
          <Typography level="h1" className="mb-12">
            {t('page.title')}
          </Typography>

          {/* Quick facts */}
          <div className="mb-12 grid grid-cols-2 gap-6 border-y border-border py-8 sm:grid-cols-3">
            <div>
              <Typography level="overline" tone="tertiary" className="mb-1 block">
                {t('born')}
              </Typography>
              <Typography level="body">{artistBiography.born}</Typography>
            </div>
            <div>
              <Typography level="overline" tone="tertiary" className="mb-1 block">
                {t('nationality')}
              </Typography>
              <Typography level="body">{nationality}</Typography>
            </div>
            <div>
              <Typography level="overline" tone="tertiary" className="mb-1 block">
                {t('lives')}
              </Typography>
              <Typography level="body">{livesAndWorks}</Typography>
            </div>
          </div>

          {/* Full bio */}
          <div className="prose-style">
            {fullBio.split('\n\n').map((paragraph, i) => (
              <Typography key={i} level="body-lg" tone="secondary" className="mb-6 text-pretty">
                {paragraph}
              </Typography>
            ))}
          </div>
        </Container>
      </Section>

      {/* Timeline */}
      {artistBiography.timeline.length > 0 && (
        <Section spacing="lg" background="muted">
          <Container width="narrow">
            <Typography level="h2" className="mb-10">
              {t('sections.exhibitions')}
            </Typography>
            <div className="space-y-0">
              {artistBiography.timeline.map((entry, idx) => (
                <TimelineEntry key={idx} entry={entry} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}

function TimelineEntry({ entry }: { entry: (typeof artistBiography.timeline)[number] }) {
  const { i18n } = useTranslation();
  const locale = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'tr';
  const title = entry.title[locale] ?? entry.title.en;
  const description = entry.description[locale] ?? entry.description.en;

  return (
    <div className="flex gap-8 border-b border-border py-6 last:border-0">
      <Typography level="h4" tone="tertiary" className="w-16 shrink-0">
        {entry.year}
      </Typography>
      <div>
        <Typography level="body" className="mb-1">
          {title}
        </Typography>
        <Typography level="body-sm" tone="secondary">
          {description}
        </Typography>
      </div>
    </div>
  );
}
