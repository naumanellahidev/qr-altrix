'use client';

import * as React from 'react';
import { Check, Copy, ExternalLink, ImageUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ToolsCopy } from '@/content/schema';

type Copy = Pick<ToolsCopy['scanner'], 'drop' | 'choose' | 'reading' | 'found' | 'notFound' | 'openLink' | 'copy' | 'copied'>;
type State = { kind: 'idle' } | { kind: 'reading' } | { kind: 'found'; text: string } | { kind: 'missing' };

/** Longest side the image is scaled to before decoding: enough for any real code, fast. */
const MAX_SIDE = 1600;

/**
 * ZXing (the decoder family phone cameras use) handles styled codes, logos and text near
 * the code far better than jsQR. Its WebAssembly is served from this site, never a CDN.
 */
let zxingReady: Promise<typeof import('zxing-wasm/reader')> | null = null;
function loadZxing() {
  zxingReady ??= import('zxing-wasm/reader').then(async (reader) => {
    await reader.prepareZXingModule({
      overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? '/vendor/zxing_reader.wasm' : prefix + path) },
      fireImmediately: true,
    });
    return reader;
  });
  return zxingReady;
}

async function decodeWithZxing(image: ImageData): Promise<string | null> {
  try {
    const reader = await loadZxing();
    const results = await reader.readBarcodes(image, { formats: ['QRCode'], tryHarder: true, tryInvert: true });
    return results.find((result) => result.isValid)?.text ?? null;
  } catch {
    // The WebAssembly could not load (old browser, blocked file): jsQR still runs.
    zxingReady = null;
    return null;
  }
}

async function decode(file: Blob): Promise<string | null> {
  const [{ default: jsQR }, bitmap] = await Promise.all([import('jsqr'), createImageBitmap(file)]);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  // White underneath, so transparent PNG codes read as dark-on-light.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const image = context.getImageData(0, 0, width, height);
  return (
    (await decodeWithZxing(image)) ??
    jsQR(image.data, width, height, { inversionAttempts: 'attemptBoth' })?.data ??
    null
  );
}

function isWebLink(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Reads a QR code from an uploaded, dropped or pasted image — entirely in the browser. */
export function QrScanner({ copy }: { copy: Copy }) {
  const [state, setState] = React.useState<State>({ kind: 'idle' });
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const read = React.useCallback(async (file: Blob | null | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setCopied(false);
    setState({ kind: 'reading' });
    try {
      const text = await decode(file);
      setState(text ? { kind: 'found', text } : { kind: 'missing' });
    } catch {
      setState({ kind: 'missing' });
    }
  }, []);

  // Paste a screenshot anywhere on the page.
  React.useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = [...(event.clipboardData?.items ?? [])].find((entry) => entry.type.startsWith('image/'));
      if (item) void read(item.getAsFile());
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [read]);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard refused; the text is selectable */
    }
  }

  return (
    <div className="space-y-4">
      <label
        htmlFor="qr-scan-file"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void read(event.dataTransfer.files?.[0]);
        }}
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? 'border-primary bg-primary-soft/60' : 'border-border bg-surface-muted/50 hover:border-primary/40'
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="max-h-48 max-w-full rounded-lg object-contain" />
        ) : (
          <ImageUp className="size-8 text-muted-foreground" aria-hidden />
        )}
        <span className="text-[14px] text-muted-foreground">
          {copy.drop} <span className="font-semibold text-primary-soft-foreground underline underline-offset-4">{copy.choose}</span>
        </span>
        <input
          ref={inputRef}
          id="qr-scan-file"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void read(event.target.files?.[0])}
        />
      </label>

      <div aria-live="polite">
        {state.kind === 'reading' ? (
          <p className="flex items-center gap-2 text-[14px] text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> {copy.reading}
          </p>
        ) : null}
        {state.kind === 'missing' ? <p className="text-[14px] text-destructive">{copy.notFound}</p> : null}
        {state.kind === 'found' ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{copy.found}</p>
            <p className="mt-2 select-all break-all font-mono text-[14px] leading-6" dir="ltr">
              {state.text}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isWebLink(state.text) ? (
                <Button asChild variant="brand" size="sm">
                  <a href={state.text} target="_blank" rel="noopener noreferrer nofollow">
                    <ExternalLink /> {copy.openLink}
                  </a>
                </Button>
              ) : null}
              <Button variant="outline" size="sm" onClick={() => void copyText(state.text)}>
                {copied ? <Check /> : <Copy />} {copied ? copy.copied : copy.copy}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
