import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { PageTitle } from '@shared/ui/PageTitle';
import { SectionTitle } from '@shared/ui/SectionTitle';

export default function MediaPage() {
  const { t } = useTranslation('media');

  return (
    <>
      {/* Page header */}
      <Section spacing="none" background="default" className="pb-4 pt-6 md:pt-section-sm">
        <Container width="wide">
          <div>
            <PageTitle className="mb-4">{t('page.title')}</PageTitle>
            <SectionTitle style={{ marginBottom: 0 }}>{t('page.subtitle')}</SectionTitle>
          </div>
        </Container>
      </Section>
      {/* Content */}
      <Section spacing="lg" background="default" className="pt-8">
        <Container width="wide">
          <Typography level="h3" tone="tertiary" align="center" className="py-24">
            {t('underConstruction')}
          </Typography>
        </Container>
      </Section>
    </>
  );
}
