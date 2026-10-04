'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Infinity as InfinityIcon, Palette, Pencil, Sparkles, Wand2 } from 'lucide-react';
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
import { DesignEditor } from '@/components/qr/design-editor';
import { QrPreview } from '@/components/qr/qr-preview';
import { ScanSafety } from '@/components/qr/scan-safety';
import { DownloadGate } from '@/components/qr/download-menu';
import dynamic from 'next/dynamic';

// The sign-up dialog (form, validation, Google button) is only needed once someone asks
// to download, so it loads then instead of being parsed and hydrated with the page.
const AuthDialog = dynamic(() => import('@/components/auth/auth-dialog').then((m) => m.AuthDialog), { ssr: false });
import {
  draftIsComplete,
  persistDraftToServer,
  previewPayload,
  useQrDraft,
} from '@/components/qr/use-draft';

export interface HeroGeneratorProps {
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
}: HeroGeneratorProps) {
  const router = useRouter();
  const { draft, setType, patchContent, patchDesign, setName } = useQrDraft('URL');
  const [authOpen, setAuthOpen] = React.useState(false);
  // Mount the dialog on first use and keep it mounted, so closing it still animates.
  const authRequested = useLatch(authOpen);
  const [authMode, setAuthMode] = React.useState<'signup' | 'login'>('signup');
  const [moduleCount, setModuleCount] = React.useState(33);
  const [gateReason, setGateReason] = React.useState<string | null>(null);

  const def = getTypeDef(draft.type);
  const payload = previewPayload(draft, shortUrlBase);
  const complete = draftIsComplete(draft);
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
      {/* ------------------------------------------------------------- builder */}
      <Card className="relative overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold">
              <Wand2 className="size-3.5 text-primary" />
              Make a QR code
            </p>
            <p className="text-[12.5px] text-muted-foreground">
              No sign-up needed to design it. Takes about thirty seconds.
            </p>
          </div>
          <Badge variant="success">
            <InfinityIcon className="size-3" /> {expiryEnabled ? 'Free to use' : 'Never expires'}
          </Badge>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              1 · What should it do?
            </p>
            <TypePicker value={draft.type} onChange={(type) => setType(type)} types={FEATURED_TYPES} variant="strip" />
            {def ? (
              <p className="text-[12.5px] leading-5 text-muted-foreground">
                <span className="font-medium text-foreground">{def.label}:</span> {def.description}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              2 · Add your content
            </p>
            <ContentForm
              type={draft.type}
              value={draft.content}
              onChange={patchContent}
              onRequireAccount={(reason) => void openGate('signup', reason)}
            />
            {def?.kind === 'DYNAMIC' ? (
              <Alert tone="info" title="This is a dynamic code">
                The printed pattern points at a short link, so you can change where it goes later and see every scan.
                A free account keeps it editable forever.
              </Alert>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              3 · Make it yours
            </p>
            <Tabs defaultValue="design">
              <TabsList>
                <TabsTrigger value="design">
                  <Palette /> Design
                </TabsTrigger>
                <TabsTrigger value="name">
                  <Pencil /> Name
                </TabsTrigger>
              </TabsList>
              <TabsContent value="design" className="pt-3">
                <DesignEditor
                  design={draft.design}
                  onChange={patchDesign}
                  compact
                />
              </TabsContent>
              <TabsContent value="name" className="pt-3">
                <Field
                  label="Name this code"
                  htmlFor="draft-name"
                  help="Only you see this. It makes the code easy to find later."
                >
                  <Input
                    id="draft-name"
                    value={draft.name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={def ? `${def.label} code` : 'My QR code'}
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
            <p className="text-[13px] font-semibold">Live preview</p>
            <Badge variant="outline">{draft.kind === 'DYNAMIC' ? 'Dynamic' : 'Static'}</Badge>
          </div>

          <div className="flex justify-center rounded-2xl bg-surface-muted/60 p-4">
            <QrPreview
              data={payload}
              design={draft.design}
              size={272}
              onRender={({ moduleCount: count }) => setModuleCount(count)}
              placeholder={
                def ? `Fill in the ${def.label.toLowerCase()} details and your code appears here instantly.` : undefined
              }
            />
          </div>

          <ScanSafety design={draft.design} moduleCount={moduleCount} compact />

          {signedIn ? (
            <Button variant="brand" size="lg" className="w-full" onClick={() => void continueSignedIn()}>
              Open in my dashboard <ArrowRight />
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
                    ? 'Free account keeps your code editable and tracked.'
                    : expiryEnabled
                      ? 'Free account — no card, no subscription.'
                      : 'Free account — no card, no trial, no expiry.'
                  : 'Add your content to enable the download.'
              }
            />
          )}

          <ul className="space-y-1.5 text-[12px] leading-5 text-muted-foreground">
            <li className="flex gap-1.5">
              <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
              PNG, SVG, PDF, JPEG, WebP and EPS exports.
            </li>
            <li className="flex gap-1.5">
              <InfinityIcon className="mt-0.5 size-3 shrink-0 text-success" />
              {expiryEnabled
                ? 'Every code shows its expiry date in your dashboard.'
                : 'Dynamic codes stay live until you pause or delete them.'}
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
        preview={payload ? { data: payload, design: draft.design, label: draft.name || def?.label } : null}
        description={gateReason ?? 'Sign up to download your QR Code'}
        onSuccess={handleAuthSuccess}
      />
      ) : null}
    </div>
  );
}

/** False until `value` is first true, then true for good. */
function useLatch(value: boolean): boolean {
  const [latched, setLatched] = React.useState(value);
  if (value && !latched) setLatched(true);
  return latched || value;
}
