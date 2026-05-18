import { type ElementType, type ComponentPropsWithRef } from 'react';
import { buttonVariants, type ButtonVariants } from '@design-system/variants/button';
import { cn } from '@shared/utils/cn';

// Polymorphic helper — derives the correct props type for any `as` element
type AsProp<C extends ElementType> = { as?: C };
type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);
type PolymorphicComponentProp<C extends ElementType, Props = object> = React.PropsWithChildren<
  Props & AsProp<C>
> &
  Omit<ComponentPropsWithRef<C>, PropsToOmit<C, Props>>;

export type ButtonProps<C extends ElementType = 'button'> = PolymorphicComponentProp<
  C,
  ButtonVariants & { isLoading?: boolean }
>;

/**
 * Polymorphic Button — renders as <button>, <a>, or any element via `as`.
 * Use `as={Link} to="/path"` for react-router link buttons.
 */
export function Button<C extends ElementType = 'button'>({
  as,
  variant,
  size,
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps<C>) {
  const Component = (as ?? 'button') as ElementType;
  const isDisabled = disabled || isLoading;

  return (
    <Component
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={Component !== 'button' && isDisabled ? true : undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </Component>
  );
}
