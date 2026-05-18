import MuiCard from '@mui/material/Card';
import Box from '@mui/material/Box';
import { forwardRef, type HTMLAttributes } from 'react';
import { cardVariants, type CardVariants } from '@design-system/variants/card';
import { cn } from '@shared/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement>, CardVariants {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant, radius, hover, padding, className, children, ...props }, ref) => {
    return (
      <MuiCard
        ref={ref}
        className={cn(cardVariants({ variant, radius, hover, padding }), className)}
        {...props}
      >
        {children}
      </MuiCard>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <Box ref={ref} className={cn('mb-4 border-b border-border pb-4', className)} {...props}>
      {children}
    </Box>
  )
);
CardHeader.displayName = 'CardHeader';

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <Box ref={ref} className={cn('', className)} {...props}>
      {children}
    </Box>
  )
);
CardBody.displayName = 'CardBody';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <Box ref={ref} className={cn('mt-4 border-t border-border pt-4', className)} {...props}>
      {children}
    </Box>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
