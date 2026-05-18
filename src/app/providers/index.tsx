import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';

/**
 * Root providers wrapper — compose all app-level providers here.
 * Order matters: outer providers are available to inner providers.
 */
interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
