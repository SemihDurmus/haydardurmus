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
      {/* Key by pathname only (not search params), so changing filters/sort —
          which only touch the query string — doesn't reset scroll position.
          Actual page navigations (a new pathname) still reset to top. */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </div>
  );
}
