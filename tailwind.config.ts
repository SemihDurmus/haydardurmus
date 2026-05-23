import type { Config } from 'tailwindcss';
import { colors, fontFamily, fontSize, spacing, borderRadius } from './src/design-system/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Override default container to use our token
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2rem',
      },
    },

    extend: {
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        background: colors.background,
        surface: colors.surface,
        muted: colors.muted,
        border: colors.border,
        grey: colors.grey,
        text: colors.text,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
      },

      fontFamily: {
        heading: fontFamily.heading,
        serif: fontFamily.serif,
        sans: fontFamily.sans,
        mono: fontFamily.mono,
      },

      fontSize: {
        'display-xl': fontSize['display-xl'],
        'display-lg': fontSize['display-lg'],
        display: fontSize.display,
        h1: fontSize.h1,
        h2: fontSize.h2,
        h3: fontSize.h3,
        h4: fontSize.h4,
        'body-lg': fontSize['body-lg'],
        body: fontSize.body,
        'body-sm': fontSize['body-sm'],
        caption: fontSize.caption,
        label: fontSize.label,
        overline: fontSize.overline,
      },

      spacing: {
        'section-sm': spacing.section.sm,
        'section-md': spacing.section.md,
        'section-lg': spacing.section.lg,
        'section-xl': spacing.section.xl,
        'section-2xl': spacing.section['2xl'],
        'container-xs': spacing.container.xs,
        'container-sm': spacing.container.sm,
        'container-md': spacing.container.md,
        'container-lg': spacing.container.lg,
        'container-xl': spacing.container.xl,
        'container-2xl': spacing.container['2xl'],
      },

      maxWidth: {
        'container-xs': spacing.container.xs,
        'container-sm': spacing.container.sm,
        'container-md': spacing.container.md,
        'container-lg': spacing.container.lg,
        'container-xl': spacing.container.xl,
        'container-2xl': spacing.container['2xl'],
      },

      borderRadius: {
        sm: borderRadius.sm,
        DEFAULT: borderRadius.DEFAULT,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        '2xl': borderRadius['2xl'],
      },

      // Custom animation for gallery
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // Aspect ratios for gallery
      aspectRatio: {
        portrait: '3 / 4',
        landscape: '4 / 3',
        square: '1 / 1',
        wide: '16 / 9',
        cinematic: '21 / 9',
      },
    },
  },
  plugins: [],
} satisfies Config;
