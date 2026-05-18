import { type HTMLAttributes, type ElementType, type Ref } from 'react';
import { cn } from '@shared/utils/cn';

type SectionSpacing = 'sm' | 'md' | 'lg' | 'xl' | 'none';
type SectionBackground = 'default' | 'muted' | 'dark' | 'none';

const spacingClasses: Record<SectionSpacing, string> = {
  none: '',
  sm: 'py-section-sm',
  md: 'py-section-md',
  lg: 'py-section-lg',
  xl: 'py-section-xl',
};

const backgroundClasses: Record<SectionBackground, string> = {
  none: '',
  default: 'bg-background',
  muted: 'bg-muted',
  dark: 'bg-primary-900 text-text-inverted',
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing;
  background?: SectionBackground;
  as?: 'section' | 'div' | 'article' | 'aside';
  ref?: Ref<HTMLElement>;
}

/**
 * Full-width page section with consistent vertical rhythm.
 * Spacing and background are controlled via design tokens.
 */
export function Section({
  spacing = 'md',
  background = 'default',
  as: Tag = 'section',
  className,
  children,
  ref,
  ...props
}: SectionProps) {
  const As = Tag as ElementType;
  return (
    <As
      ref={ref}
      className={cn(spacingClasses[spacing], backgroundClasses[background], className)}
      {...props}
    >
      {children}
    </As>
  );
}
