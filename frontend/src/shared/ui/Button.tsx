import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { buttonVariants, type ButtonVariants } from '@design-system/variants/button';
import { cn } from '@shared/utils/cn';

type NativeButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'color'>;

export interface ButtonProps extends NativeButtonProps, ButtonVariants {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  href?: string;
  isLoading?: boolean;
  rel?: string;
  target?: string;
  to?: string;
}

/**
 * MUI-backed Button wrapper.
 *
 * Application code should import this wrapper instead of `@mui/material/Button`
 * so the underlying UI library can be themed or replaced later.
 */
export function Button({
  as,
  variant,
  size,
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const Component = as ?? 'button';
  const isDisabled = disabled || isLoading;

  return (
    <MuiButton
      component={Component}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size }), className)}
      startIcon={
        isLoading ? <CircularProgress aria-hidden color="inherit" size={14} thickness={5} /> : undefined
      }
      {...props}
    >
      {children}
    </MuiButton>
  );
}
