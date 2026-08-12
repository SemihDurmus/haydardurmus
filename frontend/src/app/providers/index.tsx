import type { ReactNode } from 'react';
import { MuiThemeProvider } from './MuiThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@domains/auth/AuthContext';
import { ToastProvider } from '@shared/ui/feedback/ToastProvider';
import { ConfirmProvider } from '@shared/ui/feedback/ConfirmProvider';

/**
 * Root providers wrapper — compose all app-level providers here.
 * Order matters: outer providers are available to inner providers.
 */
interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MuiThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </MuiThemeProvider>
  );
}
