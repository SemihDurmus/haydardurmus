import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/ui/Button';
import { ApiError } from '@shared/api/client';
import { useAuth } from '@domains/auth/useAuth';

interface LocationState {
  from?: { pathname: string };
}

export default function AdminLoginPage() {
  const { t } = useTranslation('admin');
  const { login, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip the form.
  if (!isInitializing && isAuthenticated) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('login.genericError'));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full border border-border bg-background px-4 py-2.5 font-sans text-body-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-primary-400 focus:outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-border bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 font-heading text-2xl text-text-primary">{t('login.title')}</h1>
        <p className="mb-6 text-body-sm text-text-tertiary">{t('login.subtitle')}</p>

        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-700">
            {error}
          </div>
        )}

        <label className="mb-1 block text-label uppercase tracking-wide text-text-tertiary">
          {t('login.username')}
        </label>
        <input
          className={`${inputClass} mb-4`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
        />

        <label className="mb-1 block text-label uppercase tracking-wide text-text-tertiary">
          {t('login.password')}
        </label>
        <input
          className={`${inputClass} mb-6`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
          {t('login.submit')}
        </Button>
      </form>
    </div>
  );
}
