'use client';

import {
  BarChart3, Building2, Code2, Flag, Gauge, Globe, Layers, LayoutDashboard, LifeBuoy, Palette,
  Plus, QrCode, Server, Settings, ShieldCheck, SlidersHorizontal, Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  BarChart3, Building2, Code2, Flag, Gauge, Globe, Layers, LayoutDashboard, LifeBuoy, Palette,
  Plus, QrCode, Server, Settings, ShieldCheck, SlidersHorizontal, Users,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? QrCode;
  return <Component className={cn('size-[17px]', className)} aria-hidden />;
}
