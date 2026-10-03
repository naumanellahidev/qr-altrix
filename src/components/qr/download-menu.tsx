'use client';

import * as React from 'react';
import { ChevronDown, Download, Lock, Mail } from 'lucide-react';
import { EXPORT_FORMATS, type ExportFormat, type QrDesign } from '@/lib/qr/types';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GoogleIcon } from '@/components/auth/google-icon';
import { toast } from 'sonner';

export interface DownloadRequest {
  data: string;
  design: Partial<QrDesign>;
  name?: string;
  /** Static codes may be downloaded by guests when the admin allows it. */
  kind?: 'STATIC' | 'DYNAMIC';
  /** Existing saved code — the server then re-renders from the database. */
  qrCodeId?: string;
}

const SIZES = [
  { value: 512, label: 'Small · 512 px' },
  { value: 1024, label: 'Medium · 1024 px' },
  { value: 2048, label: 'Large · 2048 px' },
  { value: 4096, label: 'Huge · 4096 px' },
];

export async function downloadQrFile(request: DownloadRequest & { format: ExportFormat; size?: number }) {
  const response = await fetch('/api/render', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => ({ error: 'Download failed' }));
    throw new Error(problem.error ?? 'Download failed');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] ?? `qr-altrix.${request.format === 'jpeg' ? 'jpg' : request.format}`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export interface DownloadMenuProps extends Pick<ButtonProps, 'variant' | 'size' | 'className'> {
  request: DownloadRequest;
  disabled?: boolean;
  label?: string;
  defaultSize?: number;
}

/** Full format picker for signed-in users. */
export function DownloadMenu({
  request,
  disabled,
  label = 'Download',
  defaultSize = 1024,
  variant = 'brand',
  size = 'lg',
  className,
}: DownloadMenuProps) {
  const [busy, setBusy] = React.useState<ExportFormat | null>(null);
  const [pixelSize, setPixelSize] = React.useState(defaultSize);

  async function run(format: ExportFormat) {
    setBusy(format);
    try {
      await downloadQrFile({ ...request, format, size: pixelSize });
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled} loading={Boolean(busy)} className={className}>
          <Download /> {label}
          <ChevronDown className="opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>File format</DropdownMenuLabel>
        {EXPORT_FORMATS.map((format) => (
          <DropdownMenuItem key={format.value} onSelect={() => void run(format.value)} className="flex-col items-start gap-0.5">
            <span className="font-medium">{format.label}</span>
            <span className="text-[11.5px] text-muted-foreground">{format.hint}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Image size</DropdownMenuLabel>
        {SIZES.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={(event) => {
              event.preventDefault();
              setPixelSize(option.value);
            }}
          >
            <span className={option.value === pixelSize ? 'font-medium text-primary' : undefined}>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface DownloadGateProps {
  request: DownloadRequest;
  disabled?: boolean;
  /** Static codes may be downloadable without an account, if the admin allows it. */
  allowGuestDownload?: boolean;
  onEmailSignup: () => void;
  onGoogleSignup: () => void;
  hint?: string;
}

/**
 * The homepage download control. A visitor can always design freely; the account step
 * only appears at the moment of download, and the draft is preserved through it.
 */
export function DownloadGate({
  request,
  disabled,
  allowGuestDownload,
  onEmailSignup,
  onGoogleSignup,
  hint,
}: DownloadGateProps) {
  const [busy, setBusy] = React.useState(false);

  async function guestDownload(format: ExportFormat) {
    setBusy(true);
    try {
      await downloadQrFile({ ...request, format, size: 1024 });
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="brand" size="lg" className="w-full" disabled={disabled} loading={busy}>
            <Download /> Download QR code
            <ChevronDown className="opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[17rem]">
          <DropdownMenuLabel>Save your code</DropdownMenuLabel>
          <DropdownMenuItem onSelect={onGoogleSignup} className="gap-2.5">
            <GoogleIcon className="size-4" />
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-medium">Download with Google</span>
              <span className="text-[11.5px] text-muted-foreground">One tap, no password</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onEmailSignup} className="gap-2.5">
            <Mail />
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-medium">Download with Email</span>
              <span className="text-[11.5px] text-muted-foreground">Free account, keeps your code editable</span>
            </span>
          </DropdownMenuItem>

          {allowGuestDownload ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Or download without an account</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => void guestDownload('png')}>PNG image</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void guestDownload('svg')}>SVG vector</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void guestDownload('pdf')}>PDF for print</DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuSeparator />
              <div className="flex gap-2 px-2.5 py-2 text-[11.5px] leading-5 text-muted-foreground">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                An account keeps this code editable and tracked. It is free, with no expiry.
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {hint ? <p className="text-center text-[12px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
