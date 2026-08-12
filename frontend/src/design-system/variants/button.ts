import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles — applied to all buttons
  [
    'inline-flex items-center justify-center gap-2',
    'font-sans text-label uppercase tracking-[0.06em]',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-900 text-text-inverted',
          'hover:bg-primary-700',
          'active:bg-primary-950',
        ],
        secondary: [
          'bg-transparent text-primary-900 border border-primary-900',
          'hover:bg-primary-50',
          'active:bg-primary-100',
        ],
        ghost: [
          'bg-transparent text-primary-900',
          'hover:bg-primary-50',
          'active:bg-primary-100',
        ],
        accent: [
          'bg-accent text-text-inverted',
          'hover:bg-accent-dark',
          'active:bg-accent-dark',
        ],
        link: [
          'bg-transparent text-accent p-0 h-auto',
          'underline-offset-4 hover:underline',
        ],
        danger: [
          'bg-error text-text-inverted',
          'hover:bg-error-dark',
          'active:bg-error-dark',
        ],
      },
      size: {
        sm: 'h-8 px-4 text-[0.625rem]',
        md: 'h-10 px-6',
        lg: 'h-12 px-8 text-[0.75rem]',
        xl: 'h-14 px-10 text-[0.75rem]',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
