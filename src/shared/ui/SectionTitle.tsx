import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { colors } from '@design-system/tokens';
import { Typography } from './Typography';
import { cn } from '@shared/utils/cn';

export interface SectionTitleProps extends Omit<ComponentPropsWithoutRef<'h3'>, 'children'> {
  children: ReactNode;
  color?: string;
}

export function SectionTitle({
  children,
  className,
  color = colors.grey[40],
  style,
  ...props
}: SectionTitleProps) {
  return (
    <Typography
      as="h3"
      className={cn(
        'font-heading !text-[18px] !leading-tight md:!text-[26px]',
        className
      )}
      style={{
        color,
        fontFamily: 'Oswald, Inter, system-ui, sans-serif',
        marginBottom: '1rem',
        ...style,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}
