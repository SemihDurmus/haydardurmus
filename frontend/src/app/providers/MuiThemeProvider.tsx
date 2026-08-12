import { CssBaseline, ThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';
import { muiTheme } from '@design-system/theme';

interface MuiThemeProviderProps {
  children: ReactNode;
}

export function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
