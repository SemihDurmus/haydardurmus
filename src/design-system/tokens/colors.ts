/**
 * Color tokens — single source of truth for all colors in the application.
 * These are imported by tailwind.config.ts to extend the theme.
 * Changing a value here affects every component that uses the token.
 */
export const colors = {
  // Brand palette
  primary: {
    DEFAULT: '#1a1a1a',
    50: '#f5f5f5',
    100: '#e8e8e8',
    200: '#d1d1d1',
    300: '#b0b0b0',
    400: '#888888',
    500: '#6d6d6d',
    600: '#5d5d5d',
    700: '#4f4f4f',
    800: '#454545',
    900: '#1a1a1a',
    950: '#0d0d0d',
  },

  // Warm accent — earthy, gallery-like
  accent: {
    DEFAULT: '#8b7355',
    light: '#a89070',
    dark: '#6b5540',
    subtle: '#f5efe8',
  },

  // Semantic neutrals — warm-toned off-whites
  background: '#fafaf8',
  surface: '#ffffff',
  muted: '#f4f3ef',
  border: '#e8e6e1',

  // Text hierarchy
  text: {
    primary: '#1a1a1a',
    title: '#2971A6',
    secondary: '#6b6b6b',
    tertiary: '#9a9a9a',
    inverted: '#ffffff',
    accent: '#8b7355',
  },

  // Semantic states
  success: {
    DEFAULT: '#27ae60',
    light: '#eafaf1',
    dark: '#1e8449',
  },
  warning: {
    DEFAULT: '#f39c12',
    light: '#fef9e7',
    dark: '#d68910',
  },
  error: {
    DEFAULT: '#c0392b',
    light: '#fadbd8',
    dark: '#922b21',
  },
  info: {
    DEFAULT: '#2980b9',
    light: '#d6eaf8',
    dark: '#1f618d',
  },
} as const;

export type ColorToken = typeof colors;
