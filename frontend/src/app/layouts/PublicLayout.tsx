import { Outlet, ScrollRestoration } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Public layout — wraps all public-facing pages.
 * Future layouts: AuthLayout, AdminLayout can be added alongside this.
 */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-12 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
