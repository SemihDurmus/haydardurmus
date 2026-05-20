import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@shared/ui/Container';
import { LanguageSwitcher } from '@shared/components/LanguageSwitcher';
import { ROUTES } from '@app/router/routes';
import { cn } from '@shared/utils/cn';

const headerImageModules = import.meta.glob<string>('/src/assets/header_image.png', {
  eager: true,
  import: 'default',
  query: '?url',
});
const headerImage = Object.values(headerImageModules)[0];

export function Header() {
  const { t } = useTranslation('common');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { label: t('nav.biography'), href: ROUTES.BIOGRAPHY },
    { label: t('nav.paintings'), href: ROUTES.PAINTINGS },
    { label: t('nav.collections'), href: ROUTES.COLLECTIONS },
    { label: t('nav.media'), href: ROUTES.MEDIA },
    { label: t('nav.book'), href: ROUTES.BOOK },
    { label: t('nav.contact'), href: ROUTES.CONTACT },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'font-sans text-label uppercase tracking-widest transition-colors duration-200',
      isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
    );

  return (
    <header
      className={cn(
        'fixed top-0 z-40 w-full transition-all duration-300',
        scrolled ? 'bg-background/95 backdrop-blur-sm border-b border-border' : 'bg-transparent'
      )}
    >
      <Container width="wide">
        <div className="relative flex h-16 items-center justify-end md:h-20">
          {headerImage && (
            <Link
              to={ROUTES.HOME}
              className="absolute left-0 flex items-center transition-opacity hover:opacity-80"
              aria-label="Go to home page"
            >
              <img
                src={headerImage}
                alt="Haydar Durmuş"
                className="h-10 w-auto rounded-lg object-contain sm:h-12 md:h-14 lg:h-16"
              />
            </Link>
          )}

          {/* Desktop Nav */}
          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            {navItems.map(({ label, href }) => (
              <NavLink key={href} to={href} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-6">
            <LanguageSwitcher className="hidden md:flex" />

            {/* Mobile menu toggle */}
            <button
              className="flex h-8 w-8 items-center justify-center md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <Container>
            <nav className="flex flex-col gap-1 py-4" aria-label="Mobile navigation">
              {navItems.map(({ label, href }) => (
                <NavLink
                  key={href}
                  to={href}
                  className={({ isActive }) =>
                    cn(
                      'block py-3 font-sans text-label uppercase tracking-widest transition-colors',
                      isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    )
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
              <div className="mt-4 border-t border-border pt-4">
                <LanguageSwitcher />
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
