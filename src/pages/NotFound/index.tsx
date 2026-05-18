import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/ui/Section';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { Button } from '@shared/ui/Button';
import { ROUTES } from '@app/router/routes';

export default function NotFoundPage() {
  const { t } = useTranslation('common');
  return (
    <Section spacing="xl" background="default">
      <Container width="narrow">
        <div className="flex flex-col items-center text-center">
          <Typography level="display-lg" tone="tertiary" className="mb-4">404</Typography>
          <Typography level="h2" className="mb-4">{t('status.notFound')}</Typography>
          <Typography level="body" tone="secondary" className="mb-8">
            The page you are looking for does not exist.
          </Typography>
          <Button as={Link} to={ROUTES.HOME}>{t('nav.home')}</Button>
        </div>
      </Container>
    </Section>
  );
}
