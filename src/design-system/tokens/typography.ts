/**
 * Typography tokens — font families, sizes, weights, and line heights.
 * Changing a value here via tailwind.config.ts affects the entire application.
 */

export const fontFamily = {
  // Primary serif — for headings, artist name, display text
  serif: ['Cormorant Garamond', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
  // Clean sans-serif — for body text, UI labels
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
  // Monospace — for catalogue numbers, metadata
  mono: ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
} as const;

export const fontSize = {
  // Display — hero/artist name
  'display-xl': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '300' }],
  'display-lg': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '300' }],
  display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '300' }],

  // Headings
  h1: ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '400' }],
  h2: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '400' }],
  h3: ['1.375rem', { lineHeight: '1.35', letterSpacing: '-0.005em', fontWeight: '400' }],
  h4: ['1.125rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],

  // Body
  'body-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0' }],
  body: ['1rem', { lineHeight: '1.65', letterSpacing: '0' }],
  'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],

  // Utility
  caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
  label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.06em', fontWeight: '500' }],
  overline: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.12em', fontWeight: '500' }],
} as const;

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontFamilyToken = typeof fontFamily;
export type FontSizeToken = typeof fontSize;
