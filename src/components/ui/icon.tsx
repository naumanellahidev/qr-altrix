'use client';

import * as React from 'react';
import {
  Bitcoin, Building2, CalendarCheck, CalendarDays, CalendarPlus, Contact, FileText, Globe,
  IdCard, Images, LayoutTemplate, Link2, ListMusic, ListTree, Mail, MapPin, MessageCircle,
  MessageSquare, Music, Package, Phone, QrCode, ScanBarcode, Share2, Shuffle, Smartphone,
  Star, TicketPercent, Type, UtensilsCrossed, Video, Wifi,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** Icon registry for the QR type catalogue, so catalogue entries stay plain data. */
const ICONS: Record<string, LucideIcon> = {
  Bitcoin, Building2, CalendarCheck, CalendarDays, CalendarPlus, Contact, FileText, Globe,
  IdCard, Images, LayoutTemplate, Link2, ListMusic, ListTree, Mail, MapPin, MessageCircle,
  MessageSquare, Music, Package, Phone, QrCode, ScanBarcode, Share2, Shuffle, Smartphone,
  Star, TicketPercent, Type, UtensilsCrossed, Video, Wifi,
};

export function TypeIcon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? QrCode;
  return <Component className={cn('size-4', className)} aria-hidden />;
}

export function hasTypeIcon(name: string): boolean {
  return name in ICONS;
}
