import MuiTypography from '@mui/material/Typography';
import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { typographyVariants, type TypographyVariants } from '@design-system/variants/typography';
import { cn } from '@shared/utils/cn';

type Level = NonNullable<TypographyVariants['level']>;

const levelTagMap: Record<Level, ElementType> = {
  'display-xl': 'h1',
  'display-lg': 'h1',
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  label: 'span',
  overline: 'span',
};

export interface TypographyProps extends HTMLAttributes<HTMLElement>, TypographyVariants {
  as?: ElementType;
}

/**
 * MUI-backed centralized Typography component.
 *
 * Change any font/size/weight in design-system/tokens/typography.ts
 * and it automatically affects every instance.
 */
const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ as, level = 'body', tone, align, balance, className, children, ...props }, ref) => {
    const Tag = (as ?? (level ? levelTagMap[level] : 'p')) as ElementType;
    return (
      <MuiTypography
        component={Tag}
        ref={ref}
        className={cn(typographyVariants({ level, tone, align, balance }), className)}
        {...props}
      >
        {children}
      </MuiTypography>
    );
  }
);

Typography.displayName = 'Typography';
export { Typography };
