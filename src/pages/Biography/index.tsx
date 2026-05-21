import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { PageTitle } from '@shared/ui/PageTitle';
import {
  biographyIntroItems,
  groupExhibitions,
  soloExhibitions,
} from '@domains/biography/data/biographyContent';
import biographyImage from '@assets/biography_img.avif';

export default function BiographyPage() {
  const { t } = useTranslation('biography');

  return (
    <>
      {/* Hero */}
      <Section spacing="none" background="default" className="py-8 md:py-section-lg">
        <Container width="wide">
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px]">
            <div>
              <PageTitle className="mb-4">{t('page.title')}</PageTitle>
              <Typography
                level="h2"
                className="mb-8 leading-tight"
                style={{
                  color: '#b7b7b7',
                  fontFamily: 'Oswald, Inter, system-ui, sans-serif',
                  fontSize: 'clamp(22px, 3vw, 32px)',
                }}
              >
                {t('page.subtitle')}
              </Typography>
              <div className="mb-12" aria-hidden="true" />

              <BiographyList items={biographyIntroItems} />
            </div>

            <aside className="order-first lg:order-none">
              <figure className="mx-auto max-w-[260px] overflow-hidden rounded-xl border border-border bg-muted sm:max-w-xs md:max-w-sm lg:sticky lg:top-28 lg:max-w-none">
                <img
                  src={biographyImage}
                  alt="Haydar Durmuş"
                  className="h-auto w-full object-cover"
                  loading="eager"
                />
              </figure>
            </aside>
          </div>
        </Container>
      </Section>

      <Section spacing="none" background="muted" className="py-8 md:py-10">
        <Container width="wide">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <ExhibitionSection title="Kişisel Sergileri" items={soloExhibitions} />
            <ExhibitionSection title="Karma Sergilerden Bazıları" items={groupExhibitions} />
          </div>
        </Container>
      </Section>
    </>
  );
}

function BiographyList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex gap-4">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <Typography level="body" tone="secondary" className="text-pretty">
            {item}
          </Typography>
        </li>
      ))}
    </ul>
  );
}

function ExhibitionSection({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section>
      <Typography
        level="h3"
        style={{
          color: '#b7b7b7',
          fontFamily: 'Oswald, Inter, system-ui, sans-serif',
          fontSize: '26px',
          marginBottom: '1rem',
        }}
      >
        {title}
      </Typography>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 border-b border-border/70 pb-3 last:border-0">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <Typography level="body-sm" tone="secondary">
              {item}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  );
}
