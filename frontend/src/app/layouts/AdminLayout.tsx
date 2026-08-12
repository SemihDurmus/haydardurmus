import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@domains/auth/useAuth';
import { useUnreadMessageCount } from '@domains/admin/hooks/useContactMessages';

/** Chrome for the admin area: a slim top bar plus the routed page below. */
export function AdminLayout() {
  const { t } = useTranslation('admin');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadMessageCount();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-heading text-lg text-text-primary">
              {t('nav.title')}
            </Link>
            <nav className="flex items-center gap-4 text-body-sm">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                }
              >
                {t('nav.paintings')}
              </NavLink>
              <NavLink
                to="/admin/library"
                className={({ isActive }) =>
                  isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                }
              >
                {t('nav.library')}
              </NavLink>
              <NavLink
                to="/admin/messages"
                className={({ isActive }) =>
                  isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                }
              >
                {t('nav.messages')}
                {unreadCount ? (
                  <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary-700 px-1.5 text-caption text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </NavLink>
              <Link to="/" className="text-text-tertiary hover:text-text-primary">
                {t('nav.viewSite')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-body-sm text-text-tertiary">
            <span>{user?.username}</span>
            <button
              onClick={handleLogout}
              className="border border-border px-3 py-1 text-text-secondary transition-colors hover:border-primary-400 hover:text-text-primary"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
