import { createTheme } from '@mui/material/styles';
import { colors, fontFamily } from '@design-system/tokens';

/**
 * MUI theme generated from our design tokens.
 *
 * App code should not import MUI directly. Use `src/shared/ui/*` wrappers.
 * This keeps MUI replaceable and makes global redesigns flow through tokens.
 */
export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.DEFAULT,
      light: colors.primary[500],
      dark: colors.primary[950],
      contrastText: colors.text.inverted,
    },
    secondary: {
      main: colors.accent.DEFAULT,
      light: colors.accent.light,
      dark: colors.accent.dark,
      contrastText: colors.text.inverted,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.tertiary,
    },
    error: {
      main: colors.error.DEFAULT,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    success: {
      main: colors.success.DEFAULT,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    warning: {
      main: colors.warning.DEFAULT,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    info: {
      main: colors.info.DEFAULT,
      light: colors.info.light,
      dark: colors.info.dark,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: fontFamily.sans.join(', '),
    h1: {
      fontFamily: fontFamily.heading.join(', '),
      fontSize: '2.5rem',
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
      fontWeight: 400,
      color: colors.text.title,
    },
    h2: {
      fontFamily: fontFamily.heading.join(', '),
      fontSize: '2rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      fontWeight: 400,
      color: colors.text.title,
    },
    h3: {
      fontFamily: fontFamily.serif.join(', '),
      fontSize: '1.375rem',
      lineHeight: 1.35,
      letterSpacing: '-0.005em',
      fontWeight: 400,
    },
    h4: {
      fontFamily: fontFamily.sans.join(', '),
      fontSize: '1.125rem',
      lineHeight: 1.4,
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.65,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    button: {
      fontSize: '0.6875rem',
      lineHeight: 1.2,
      letterSpacing: '0.06em',
      fontWeight: 500,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background,
          color: colors.text.primary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          minWidth: 0,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          backgroundImage: 'none',
        },
      },
    },
  },
});
