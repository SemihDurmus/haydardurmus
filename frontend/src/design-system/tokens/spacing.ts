/**
 * Spacing tokens — padding, margin, gap scales and container widths.
 * All values flow from here into the Tailwind theme extension.
 */

export const spacing = {
  // Section-level vertical spacing
  section: {
    sm: '4rem',    // 64px
    md: '6rem',    // 96px
    lg: '8rem',    // 128px
    xl: '10rem',   // 160px
    '2xl': '14rem', // 224px
  },

  // Container max-widths
  container: {
    xs: '40rem',   // 640px — prose/reading
    sm: '48rem',   // 768px
    md: '64rem',   // 1024px — default content
    lg: '80rem',   // 1280px — wide
    xl: '90rem',   // 1440px
    '2xl': '96rem', // 1536px — full-bleed max
  },

  // Component-level
  gutter: {
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

export type SpacingToken = typeof spacing;
export type BorderRadiusToken = typeof borderRadius;
