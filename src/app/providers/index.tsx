import type { ReactNode } from 'react';
import { MuiThemeProvider } from './MuiThemeProvider';
import { QueryProvider } from './QueryProvider';

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
      <QueryProvider>{children}</QueryProvider>
    </MuiThemeProvider>
  );
}
