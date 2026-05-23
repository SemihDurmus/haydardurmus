import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@shared/ui/Container';
import { Typography } from '@shared/ui/Typography';
import { ROUTES } from '@app/router/routes';

const signatureImageModules = import.meta.glob<string>('/src/assets/signature_wobg.png', {
  eager: true,
  import: 'default',
  query: '?url',
});
const signatureImage = Object.values(signatureImageModules)[0];

export function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  const links = [
    { label: t('nav.biography'), href: ROUTES.BIOGRAPHY },
    { label: t('nav.paintings'), href: ROUTES.PAINTINGS },
    { label: t('nav.collections'), href: ROUTES.COLLECTIONS },
    { label: t('nav.media'), href: ROUTES.MEDIA },
    { label: t('nav.book'), href: ROUTES.BOOK },
    { label: t('nav.contact'), href: ROUTES.CONTACT },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <Container width="wide">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {/* Name + tagline */}
            <div>
              <Link to={ROUTES.HOME}>
                {signatureImage ? (
                  <img
                    src={signatureImage}
                    alt="Haydar Durmuş signature"
                    className="mb-3 h-12 w-auto object-contain"
                  />
                ) : (
                  <Typography level="h3" className="mb-2">
                    Haydar Durmuş
                  </Typography>
                )}
              </Link>
            </div>

            {/* Navigation */}
            <div>
              <Typography level="overline" tone="tertiary" className="mb-4 block">
                {t('footer.navigation')}
              </Typography>
              <nav className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <Link
                    key={href}
                    to={href}
                    className="font-sans text-body-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <Typography level="overline" tone="tertiary" className="mb-4 block">
                {t('nav.contact')}
              </Typography>
              <Link
                to={ROUTES.CONTACT}
                className="font-sans text-body-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {t('actions.learnMore')}
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
            <Typography level="caption" tone="tertiary">
              © {currentYear} Haydar Durmuş. {t('footer.rights')}.
            </Typography>
          </div>
        </div>
      </Container>
    </footer>
  );
}
