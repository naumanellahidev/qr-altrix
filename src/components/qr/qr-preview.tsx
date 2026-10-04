'use client';

import * as React from 'react';
import { QrCode, TriangleAlert } from 'lucide-react';
import { renderQr } from '@/lib/qr/render';
import type { QrDesign } from '@/lib/qr/types';
import { cn } from '@/lib/utils';
import { useBranding } from '@/components/qr/branding-context';

export interface QrPreviewProps {
  /** The exact string that will be encoded. */
  data: string;
  design: Partial<QrDesign>;
  size?: number;
  className?: string;
  bare?: boolean;
  /** Message shown before the user has entered anything. */
  placeholder?: string;
  onRender?: (info: { moduleCount: number }) => void;
}

/**
 * Live QR preview. It calls the same renderer the server uses for exports, so the
 * preview is not an approximation — it is the deliverable.
 */
export function QrPreview({
  data,
  design,
  size = 320,
  className,
  bare,
  placeholder = 'Your QR code appears here',
  onRender,
}: QrPreviewProps) {
  // Bare previews (thumbnails, the 2FA code) carry no credit line; full previews show the
  // same line the download will.
  const contextBranding = useBranding();
  const branding = bare ? null : contextBranding;
  const result = React.useMemo(() => {
    if (!data || data.trim() === '') return { kind: 'empty' as const };
    try {
      const rendered = renderQr(data, design, { size, bare, idPrefix: 'qap', branding });
      return { kind: 'ok' as const, rendered };
    } catch (error) {
      return { kind: 'error' as const, message: (error as Error).message };
    }
  }, [data, design, size, bare, branding]);

  React.useEffect(() => {
    if (result.kind === 'ok') onRender?.({ moduleCount: result.rendered.moduleCount });
    // onRender is intentionally not a dependency: callers pass inline functions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (result.kind === 'empty') {
    return (
      <div
        className={cn(
          'flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted/60 p-6 text-center',
          className,
        )}
        style={{ maxWidth: size }}
      >
        <QrCode className="size-7 text-muted-foreground/60" aria-hidden />
        <p className="max-w-[16rem] text-[13px] leading-5 text-muted-foreground">{placeholder}</p>
      </div>
    );
  }

  if (result.kind === 'error') {
    return (
      <div
        className={cn(
          'flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center',
          className,
        )}
        style={{ maxWidth: size }}
      >
        <TriangleAlert className="size-7 text-destructive" aria-hidden />
        <p className="max-w-[18rem] text-[13px] leading-5 text-destructive">
          This content is too long to fit in a QR code. Shorten it, or use a dynamic code so only a short link is
          encoded.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn('w-full', design.transparentBg && 'qa-checker rounded-2xl', className)}
      style={{ maxWidth: size }}
      // The markup comes from our own renderer, which escapes text and validates
      // every colour and image source before it is written. Height goes in CSS: the SVG
      // `height` attribute takes a length, and "auto" there is an error in every browser.
      dangerouslySetInnerHTML={{ __html: result.rendered.svg.replace(/width="\d+" height="\d+"/, 'width="100%" style="display:block;height:auto"') }}
    />
  );
}

/** Small preview used in tables and cards. */
export function QrThumb({
  data,
  design,
  size = 44,
  className,
}: {
  data: string;
  design: Partial<QrDesign>;
  size?: number;
  className?: string;
}) {
  const svg = React.useMemo(() => {
    if (!data) return null;
    try {
      return renderQr(data, { ...design, frame: 'none', ctaText: null, margin: 1 }, { size: size * 2, bare: true }).svg;
    } catch {
      return null;
    }
  }, [data, design, size]);

  if (!svg) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-lg border border-border bg-surface-muted', className)}
        style={{ width: size, height: size }}
      >
        <QrCode className="size-4 text-muted-foreground/60" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-hidden rounded-lg border border-border bg-white', className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`) }}
    />
  );
}
