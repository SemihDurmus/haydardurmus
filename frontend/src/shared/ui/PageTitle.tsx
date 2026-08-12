import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Typography } from './Typography';
import { cn } from '@shared/utils/cn';

export interface PageTitleProps extends Omit<ComponentPropsWithoutRef<'h1'>, 'children'> {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function PageTitle({ children, align = 'left', className, style, ...props }: PageTitleProps) {
  return (
    <Typography
      level="h1"
      align={align}
      className={cn('leading-tight', className)}
      style={{
        color: '#2971A6',
        fontFamily: 'Oswald, Inter, system-ui, sans-serif',
        fontSize: 'clamp(32px, 5vw, 50px)',
        ...style,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}
