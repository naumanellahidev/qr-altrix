'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90',
        brand:
          'bg-brand-gradient text-white shadow-glow hover:brightness-[1.06] hover:shadow-lifted',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        outline: 'border border-border bg-surface hover:bg-surface-muted',
        ghost: 'hover:bg-surface-muted hover:text-foreground',
        subtle: 'bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft/70',
        destructive: 'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90',
        'destructive-outline':
          'border border-destructive/30 text-destructive hover:bg-destructive/10',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 rounded-lg px-3 text-[13px]',
        // Compact on desktop; 36 px on touch screens, where a finger needs the room.
        xs: 'h-8 rounded-lg px-2.5 text-[12.5px] [&_svg]:size-3.5 [@media(pointer:coarse)]:h-9',
        lg: 'h-12 rounded-xl px-6 text-[15px]',
        icon: 'size-10 shrink-0',
        'icon-sm': 'size-8 shrink-0 rounded-lg [&_svg]:size-3.5 [@media(pointer:coarse)]:size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
