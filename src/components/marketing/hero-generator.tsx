'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Download, Infinity as InfinityIcon, Palette, Pencil, Sparkles, Wand2 } from 'lucide-react';
import { FEATURED_TYPES, getTypeDef } from '@/lib/qr/catalog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/feedback';
import { TypePicker } from '@/components/qr/type-picker';
import { ContentForm } from '@/components/qr/content-form';
import { QrPreview } from '@/components/qr/qr-preview';
import { ScanSafety } from '@/components/qr/scan-safety';
import { DownloadGate } from '@/components/qr/download-menu';
import dynamic from 'next/dynamic';

// The sign-up dialog (form, validation, Google button) is only needed once someone asks
// to download, so it loads then instead of being parsed and hydrated with the page.
const AuthDialog = dynamic(() => import('@/components/auth/auth-dialog').then((m) => m.AuthDialog), { ssr: false });

// The design editor (tabs, ~25 shape swatches, colour, logo and frame controls) sits
// below the fold on phones. It loads when the visitor opens it — or, on wide screens,
// as soon as the browser is idle after load — instead of being parsed and hydrated
// with the first paint. It holds controls, not content, so search engines lose nothing.
const DesignEditor = dynamic(() => import('@/components/qr/design-editor').then((m) => m.DesignEditor), {
  ssr: false,
  loading: () => <div className="h-[22rem] animate-pulse rounded-xl bg-surface-muted/70" aria-hidden />,
});
import {
  draftIsComplete,
  persistDraftToServer,
  previewPayload,
  useQrDraft,
} from '@/components/qr/use-draft';
import { fill, useGeneratorCopy } from '@/components/qr/generator-copy';
import { generator as englishCopy } from '@/content/locales/en/generator';

export interface HeroGeneratorProps {
  /** Start on this QR type (type landing pages); the draft of another type is not restored. */
  initialType?: string;
  /** Values typed before hydration, keyed by input id (see hero-generator-lazy). */
  earlyInput?: () => Record<string, string>;
  googleEnabled: boolean;
  allowGuestStaticDownload: boolean;
  shortUrlBase: string;
  signedIn: boolean;
  /** True when this install has an expiry policy, so the copy stays accurate. */
  expiryEnabled?: boolean;
}

/**
 * The homepage generator. A visitor can pick a type, fill in content and style the code
 * without an account; the account step only appears when they download, and the draft is
 * carried through signup so nothing is retyped.
 */
export function HeroGenerator({
  googleEnabled,
  allowGuestStaticDownload,
  shortUrlBase,
  signedIn,
  expiryEnabled = false,
  earlyInput,
  initialType,
}: HeroGeneratorProps) {
  const router = useRouter();
  const { copy, t } = useGeneratorCopy();
  const { draft, setType, patchContent, patchDesign, setName } = useQrDraft(initialType ?? 'URL', { pinType: Boolean(initialType) });

  // Keep whatever the visitor typed before the generator came alive. Runs after the
  // draft hook restores a saved draft, so fresh typing wins over an old draft.
  React.useEffect(() => {
    const values = earlyInput?.() ?? {};
    // A type tapped before hydration first (changing type resets the content), then text.
    if (values.__type && getTypeDef(values.__type)) setType(values.__type);
    for (const [id, value] of Object.entries(values)) {
      if (id === '__type') continue;
      if (id === 'draft-name') setName(value);
      else patchContent({ [id.slice('content-'.length)]: value });
    }
    // Once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [designOpen, setDesignOpen] = React.useState(false);

  // Wide screens have room to show the editor straight away; open it once the page is
  // idle so it never competes with the first paint.
  React.useEffect(() => {
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    const open = () => setDesignOpen(true);
    const idle = window.requestIdleCallback?.(open, { timeout: 2500 });
    const timer = idle === undefined ? window.setTimeout(open, 1200) : undefined;
    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);
  // Mount the dialog on first use and keep it mounted, so closing it still animates.
  const authRequested = useLatch(authOpen);
  const [authMode, setAuthMode] = React.useState<'signup' | 'login'>('signup');
  const [moduleCount, setModuleCount] = React.useState(33);
  const [gateReason, setGateReason] = React.useState<string | null>(null);

  const def = getTypeDef(draft.type);
  const typeLabel = def ? t(def.label) : '';
  // The featured strip, plus the page's own type when it is not one of the featured.
  const stripTypes = React.useMemo(() => {
    const pinned = initialType ? getTypeDef(initialType) : undefined;
    return pinned && !FEATURED_TYPES.some((t) => t.type === pinned.type) ? [pinned, ...FEATURED_TYPES] : FEATURED_TYPES;
  }, [initialType]);
  const payload = previewPayload(draft, shortUrlBase);
  const complete = draftIsComplete(draft);

  // On a phone the preview and the download button sit below the form, out of sight. Once
  // the code is ready, a bar at the bottom says so and takes the visitor there, but only
  // while the generator is on screen and the download button is not.
  const rootRef = React.useRef<HTMLDivElement>(null);
  const downloadRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState({ generator: false, download: false });
  React.useEffect(() => {
    const root = rootRef.current;
    const download = downloadRef.current;
    if (!root || !download || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      setInView((current) => {
        const next = { ...current };
        for (const entry of entries) {
          if (entry.target === root) next.generator = entry.isIntersecting;
          if (entry.target === download) next.download = entry.isIntersecting;
        }
        return next;
      });
    });
    observer.observe(root);
    observer.observe(download);
    return () => observer.disconnect();
  }, []);
  const showReadyBar = complete && inView.generator && !inView.download;
  const guestDownloadable = allowGuestStaticDownload && draft.kind === 'STATIC';

  async function openGate(mode: 'signup' | 'login', reason?: string) {
    setGateReason(reason ?? null);
    setAuthMode(mode);
    await persistDraftToServer(draft);
    setAuthOpen(true);
  }

  function handleAuthSuccess(result: { qrCodeId?: string | null }) {
    setAuthOpen(false);
    router.push(result.qrCodeId ? `/dashboard/codes/${result.qrCodeId}?download=1` : '/dashboard?claim=1');
    router.refresh();
  }

  async function continueSignedIn() {
    await persistDraftToServer(draft);
    router.push('/dashboard/new?claim=1');
  }

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
      {/* ------------------------------------------------------------- builder */}
      <Card className="relative overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold">
              <Wand2 className="size-3.5 text-primary" />
              {copy.makeTitle}
            </p>
            <p className="text-[12.5px] text-muted-foreground">
              {copy.makeLead}
            </p>
          </div>
          <Badge variant="success">
            <InfinityIcon className="size-3" /> {expiryEnabled ? copy.freeToUse : copy.neverExpires}
          </Badge>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              {copy.step1}
            </p>
            <TypePicker value={draft.type} onChange={(type) => setType(type)} types={stripTypes} variant="strip" />
            {def ? (
              <p className="text-[12.5px] leading-5 text-muted-foreground">
                <span className="font-medium text-foreground">{typeLabel}:</span> {t(def.description)}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              {copy.step2}
            </p>
            <ContentForm
              type={draft.type}
              value={draft.content}
              onChange={patchContent}
              onRequireAccount={(reason) => void openGate('signup', reason)}
            />
            {def?.kind === 'DYNAMIC' ? (
              <Alert tone="info" title={copy.dynamicAlertTitle}>
                {copy.dynamicAlertBody}
              </Alert>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              {copy.step3}
            </p>
            <Tabs defaultValue="design">
              <TabsList>
                <TabsTrigger value="design">
                  <Palette /> {copy.designTab}
                </TabsTrigger>
                <TabsTrigger value="name">
                  <Pencil /> {copy.nameTab}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="design" className="pt-3">
                {designOpen ? (
                  <DesignEditor design={draft.design} onChange={patchDesign} compact />
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full justify-between px-4 py-3 text-left"
                    onClick={() => setDesignOpen(true)}
                  >
                    <span className="flex flex-col">
                      <span className="text-[13.5px] font-semibold">{copy.customiseTitle}</span>
                      <span className="text-[12px] font-normal text-muted-foreground">
                        {copy.customiseBody}
                      </span>
                    </span>
                    <Palette className="size-4 text-primary" />
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="name" className="pt-3">
                <Field
                  label={copy.nameLabel}
                  htmlFor="draft-name"
                  help={copy.nameHelp}
                >
                  <Input
                    id="draft-name"
                    value={draft.name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={fill(copy.namePlaceholder, { type: typeLabel || 'QR' })}
                    maxLength={120}
                  />
                </Field>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------------- preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">{copy.livePreview}</p>
            <Badge variant="outline">{draft.kind === 'DYNAMIC' ? copy.picker.dynamic : copy.picker.static}</Badge>
          </div>

          <div className="flex justify-center rounded-2xl bg-surface-muted/60 p-4">
            <QrPreview
              data={payload}
              design={draft.design}
              size={272}
              onRender={({ moduleCount: count }) => setModuleCount(count)}
              placeholder={
                def ? fill(copy.previewPlaceholder, { type: copy === englishCopy ? typeLabel.toLowerCase() : typeLabel }) : undefined
              }
            />
          </div>
          <ScanSafety design={draft.design} moduleCount={moduleCount} compact />

          <div ref={downloadRef} className="scroll-mt-24">
          {signedIn ? (
            <Button variant="brand" size="lg" className="w-full" onClick={() => void continueSignedIn()}>
              {copy.openDashboard} <ArrowRight className="rtl:rotate-180" />
            </Button>
          ) : (
            <DownloadGate
              request={{
                data: payload,
                design: draft.design,
                kind: draft.kind,
                name: draft.name || def?.label || 'qr-altrix',
              }}
              disabled={!complete}
              allowGuestDownload={guestDownloadable}
              onEmailSignup={() => void openGate('signup')}
              onGoogleSignup={() => {
                void persistDraftToServer(draft).then(() => {
                  window.location.href = '/api/auth/google?next=%2Fdashboard%3Fclaim%3D1';
                });
              }}
              hint={
                complete
                  ? guestDownloadable
                    ? copy.hintGuest
                    : expiryEnabled
                      ? copy.hintAccountExpiry
                      : copy.hintAccount
                  : copy.hintEmpty
              }
            />
          )}
          </div>

          <ul className="space-y-1.5 text-[12px] leading-5 text-muted-foreground">
            <li className="flex gap-1.5">
              <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
              {copy.formats}
            </li>
            <li className="flex gap-1.5">
              <InfinityIcon className="mt-0.5 size-3 shrink-0 text-success" />
              {expiryEnabled ? copy.liveExpiry : copy.liveNever}
            </li>
          </ul>
        </Card>
      </div>

      {authRequested ? (
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        googleEnabled={googleEnabled}
        preview={payload ? { data: payload, design: draft.design, label: draft.name || typeLabel } : null}
        description={gateReason ?? copy.signupDescription}
        onSuccess={handleAuthSuccess}
      />
      ) : null}
      {showReadyBar ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <span className="block size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
              <QrPreview data={payload} design={draft.design} size={40} bare />
            </span>
            <p className="min-w-0 flex-1 text-[13px] font-semibold leading-5">{copy.auth.ready}</p>
            <Button
              variant="brand"
              className="shrink-0"
              onClick={() => downloadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              <Download /> {copy.download.button}
            </Button>
          </div>
        </div>
      ) : null}
      {/* Render-blocking marker for the homepage: see <link rel="expect"> in app/page.tsx. */}
      <span id="hero-ready" hidden />
    </div>
  );
}

/** False until `value` is first true, then true for good. */
function useLatch(value: boolean): boolean {
  const [latched, setLatched] = React.useState(value);
  if (value && !latched) setLatched(true);
  return latched || value;
}

