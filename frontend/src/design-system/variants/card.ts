import { cva, type VariantProps } from 'class-variance-authority';

export const cardVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-surface border border-border',
      outlined: 'bg-transparent border border-border',
      ghost: 'bg-muted border-0',
      elevated: 'bg-surface border border-border shadow-sm',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
    },
    hover: {
      true: 'transition-all duration-300 cursor-pointer hover:border-primary-300 hover:-translate-y-0.5',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    radius: 'md',
    padding: 'md',
  },
});

export type CardVariants = VariantProps<typeof cardVariants>;
