import { cva, type VariantProps } from 'class-variance-authority';

export const typographyVariants = cva('', {
  variants: {
    level: {
      'display-xl': 'font-serif text-display-xl font-light',
      'display-lg': 'font-serif text-display-lg font-light',
      display: 'font-serif text-display font-light',
      h1: 'font-serif text-h1 font-normal',
      h2: 'font-serif text-h2 font-normal',
      h3: 'font-serif text-h3 font-normal',
      h4: 'font-sans text-h4 font-medium',
      'body-lg': 'font-sans text-body-lg font-normal',
      body: 'font-sans text-body font-normal',
      'body-sm': 'font-sans text-body-sm font-normal',
      caption: 'font-sans text-caption',
      label: 'font-sans text-label uppercase tracking-[0.06em] font-medium',
      overline: 'font-sans text-overline uppercase tracking-[0.12em] font-medium',
    },
    tone: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      tertiary: 'text-text-tertiary',
      inverted: 'text-text-inverted',
      accent: 'text-accent',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    balance: {
      true: 'text-balance',
    },
  },
  defaultVariants: {
    tone: 'primary',
    align: 'left',
  },
});

export type TypographyVariants = VariantProps<typeof typographyVariants>;
