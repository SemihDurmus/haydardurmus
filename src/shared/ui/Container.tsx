import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@shared/utils/cn';

type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

const widthClasses: Record<ContainerWidth, string> = {
  narrow: 'max-w-container-xs',
  default: 'max-w-container-md',
  wide: 'max-w-container-lg',
  full: 'max-w-container-2xl',
};

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
}

/**
 * Centered layout container with responsive horizontal padding.
 * Width is controlled via the design token system.
 */
const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ width = 'default', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widthClasses[width], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
export { Container };
