'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: 'pill' | 'underline' }
>(({ className, variant = 'pill', ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  // On a phone the list scrolls sideways. Keep the selected tab in view — including one
  // opened by a link such as ?tab=account, which would otherwise sit off-screen.
  React.useEffect(() => {
    const list = innerRef.current;
    if (!list) return;
    const reveal = () => {
      const active = list.querySelector<HTMLElement>('[data-state="active"]');
      if (!active || list.scrollWidth <= list.clientWidth) return;
      const left = active.offsetLeft - list.offsetLeft;
      const target = left - (list.clientWidth - active.offsetWidth) / 2;
      list.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    };
    reveal();
    const observer = new MutationObserver(reveal);
    observer.observe(list, { attributes: true, subtree: true, attributeFilter: ['data-state'] });
    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.List
      ref={innerRef}
      className={cn(
        variant === 'pill'
          ? 'inline-flex min-h-10 items-center gap-1 rounded-xl border border-border bg-surface-muted p-1 text-muted-foreground'
          : 'flex items-center gap-5 border-b border-border text-muted-foreground',
        // Scrolls sideways on narrow screens, without a visible scrollbar.
        'max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      data-variant={variant}
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13.5px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
      'min-h-9 shrink-0 rounded-lg px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

/** Underline-style trigger for page-level tabs (Settings, Analytics). */
const TabsTriggerLine = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative -mb-px inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-0.5 pb-2.5 pt-1 text-[13.5px] font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:border-primary data-[state=active]:text-foreground [&_svg]:size-4',
      className,
    )}
    {...props}
  />
));
TabsTriggerLine.displayName = 'TabsTriggerLine';

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('focus-visible:outline-none animate-in-up', className)}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsTriggerLine, TabsContent };
