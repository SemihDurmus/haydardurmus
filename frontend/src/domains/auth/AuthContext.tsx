import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setAuthToken, setUnauthorizedHandler } from '@shared/api/client';
import { authService } from './api/authService';
import type { AdminUser } from './types';

const TOKEN_KEY = 'ag2_admin_token';

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  /** True only while restoring a stored token on first load. */
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  // Only initializing when there is a stored token to validate.
  const [isInitializing, setIsInitializing] = useState(
    () => localStorage.getItem(TOKEN_KEY) !== null,
  );

  // On first load, restore a stored token and confirm it's still valid by
  // calling /auth/me. An invalid/expired token is silently discarded.
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    setAuthToken(stored);
    authService
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        setAuthToken(null);
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user } = await authService.login(username, password);
    setAuthToken(token);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // When any authenticated request 401s (expired/revoked JWT), drop the
  // session — ProtectedRoute then redirects to the login page, remembering
  // the intended location.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isInitializing, login, logout }),
    [user, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
