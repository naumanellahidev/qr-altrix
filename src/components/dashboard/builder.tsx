'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, CalendarClock, Check, ExternalLink, Gauge, Globe, KeyRound, Link2, Lock,
  Palette, Plus, Save, Settings2, Shuffle, Smartphone, Sparkles, Tag, Trash2,
} from 'lucide-react';
import { DEFAULT_DESIGN, type QrDesign } from '@/lib/qr/types';
import { getTypeDef, QR_TYPES } from '@/lib/qr/catalog';
import { buildStaticPayload } from '@/lib/qr/payload';
import { cn, slugify } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SwitchRow } from '@/components/ui/switch';
import { Alert } from '@/components/ui/feedback';
import { InfoHint } from '@/components/ui/tooltip';
import { TypePicker } from '@/components/qr/type-picker';
import { ContentForm, type UploadedRef } from '@/components/qr/content-form';
import { DesignEditor } from '@/components/qr/design-editor';
import { QrPreview } from '@/components/qr/qr-preview';
import { ScanSafety } from '@/components/qr/scan-safety';
import { DownloadMenu, downloadQrFile } from '@/components/qr/download-menu';
import { CopyField } from '@/components/ui/copy-button';
import { QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface BuilderOption {
  id: string;
  name: string;
}

export interface BuilderDomain extends BuilderOption {
  host: string;
  status: string;
}

export interface BuilderTemplate extends BuilderOption {
  design: Partial<QrDesign>;
  isDefault: boolean;
}

export interface SmartRule {
  kind: 'COUNTRY' | 'LANGUAGE' | 'DEVICE' | 'TIME';
  matchValue: string;
  url: string;
  priority: number;
}

export interface BuilderInitialValue {
  id?: string;
  name: string;
  type: string;
  kind: 'STATIC' | 'DYNAMIC';
  content: Record<string, unknown>;
  design: Partial<QrDesign>;
  folderId?: string | null;
  customDomainId?: string | null;
  slug?: string | null;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    custom?: { key: string; value: string }[];
  } | null;
  smartRules?: SmartRule[];
  passwordProtected?: boolean;
  scheduleEnabled?: boolean;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  scanLimitEnabled?: boolean;
  scanLimitMax?: number | null;
  shortLink?: string | null;
  scanCount?: number;
}

export interface BuilderProps {
  folders: BuilderOption[];
  templates: BuilderTemplate[];
  domains: BuilderDomain[];
  brandColors: string[];
  shortUrlBase: string;
  initial?: BuilderInitialValue | null;
  mode?: 'create' | 'edit';
}

const STEPS = [
  { id: 'type', label: 'Type', icon: Sparkles },
  { id: 'content', label: 'Content', icon: Link2 },
  { id: 'behaviour', label: 'Options', icon: Settings2 },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'test', label: 'Test', icon: Smartphone },
  { id: 'save', label: 'Save', icon: Save },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const DEVICE_OPTIONS = [
  { value: 'mobile', label: 'Mobile phones' },
  { value: 'tablet', label: 'Tablets' },
  { value: 'desktop', label: 'Desktop computers' },
];

export function Builder({
  folders,
  templates,
  domains,
  brandColors,
  shortUrlBase,
  initial,
  mode = 'create',
}: BuilderProps) {
  const router = useRouter();
  const editing = mode === 'edit' && Boolean(initial?.id);

  const defaultTemplate = templates.find((template) => template.isDefault);

  const [step, setStep] = React.useState<StepId>(editing ? 'content' : 'type');
  const [type, setType] = React.useState(initial?.type ?? 'WEBSITE');
  const [kind, setKind] = React.useState<'STATIC' | 'DYNAMIC'>(initial?.kind ?? 'DYNAMIC');
  const [name, setName] = React.useState(initial?.name ?? '');
  const [content, setContent] = React.useState<Record<string, unknown>>(initial?.content ?? {});
  const [design, setDesign] = React.useState<QrDesign>({
    ...DEFAULT_DESIGN,
    ...(initial?.design ?? defaultTemplate?.design ?? {}),
  });

  const [folderId, setFolderId] = React.useState(initial?.folderId ?? '');
  const [customDomainId, setCustomDomainId] = React.useState(initial?.customDomainId ?? '');
  const [slug, setSlug] = React.useState(initial?.slug ?? '');
  const [utm, setUtm] = React.useState(initial?.utm ?? {});
  const [customParams, setCustomParams] = React.useState<{ key: string; value: string }[]>(
    initial?.utm?.custom ?? [],
  );
  const [smartRules, setSmartRules] = React.useState<SmartRule[]>(initial?.smartRules ?? []);

  const [passwordEnabled, setPasswordEnabled] = React.useState(Boolean(initial?.passwordProtected));
  const [password, setPassword] = React.useState('');
  const [scheduleEnabled, setScheduleEnabled] = React.useState(Boolean(initial?.scheduleEnabled));
  const [scheduleStart, setScheduleStart] = React.useState(initial?.scheduleStart?.slice(0, 16) ?? '');
  const [scheduleEnd, setScheduleEnd] = React.useState(initial?.scheduleEnd?.slice(0, 16) ?? '');
  const [scanLimitEnabled, setScanLimitEnabled] = React.useState(Boolean(initial?.scanLimitEnabled));
  const [scanLimitMax, setScanLimitMax] = React.useState(String(initial?.scanLimitMax ?? 1000));

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | null>(initial?.id ?? null);
  const [savedLink, setSavedLink] = React.useState<string | null>(initial?.shortLink ?? null);
  const [moduleCount, setModuleCount] = React.useState(33);

  const def = getTypeDef(type);

  // The preview encodes the real payload for static codes, and the live short link
  // (or a representative placeholder before saving) for dynamic ones.
  const payload = React.useMemo(() => {
    if (kind === 'STATIC') return buildStaticPayload(type, content);
    if (savedLink) return savedLink;
    const domain = domains.find((item) => item.id === customDomainId);
    const base = domain ? `https://${domain.host}` : `${shortUrlBase.replace(/\/$/, '')}/q`;
    const hasContent = Object.values(content).some((value) =>
      Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim() !== '' : Boolean(value),
    );
    if (!hasContent) return '';
    return `${base}/${slug ? slugify(slug) : 'PREVIEW'}`;
  }, [kind, type, content, savedLink, domains, customDomainId, shortUrlBase, slug]);

  function patchContent(patch: Record<string, unknown>) {
    setContent((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function patchDesign(patch: Partial<QrDesign>) {
    setDesign((current) => ({ ...current, ...patch }));
  }

  async function uploadFile(file: File): Promise<UploadedRef> {
    const form = new FormData();
    form.set('file', file);
    form.set('kind', file.type === 'application/pdf' ? 'pdf' : file.type.startsWith('image/') ? 'image' : 'media');

    const response = await fetch('/api/uploads', { method: 'POST', body: form });
    const payloadJson = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      url?: string;
      name?: string;
      size?: number;
      error?: string;
    };
    if (!response.ok || !payloadJson.ok || !payloadJson.url) {
      throw new Error(payloadJson.error ?? 'Upload failed');
    }
    return { url: payloadJson.url, name: payloadJson.name, size: payloadJson.size };
  }

  async function uploadLogo(file: File): Promise<string> {
    const uploaded = await uploadFile(file);
    return uploaded.url;
  }

  const missingRequired = React.useMemo(() => {
    if (!def) return [] as string[];
    return def.fields
      .filter((field) => field.required)
      .filter((field) => {
        const value = content[field.name];
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'string') return value.trim() === '';
        return value === undefined || value === null || value === '';
      })
      .map((field) => field.label);
  }, [def, content]);

  const canSave = missingRequired.length === 0 && payload !== '';

  function buildBody() {
    const cleanedCustom = customParams.filter((pair) => pair.key.trim() !== '');
    const utmPayload = {
      ...utm,
      custom: cleanedCustom.length > 0 ? cleanedCustom : undefined,
    };
    const hasUtm = Object.values(utmPayload).some((value) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value),
    );

    return {
      name: name.trim() || `${def?.label ?? 'QR'} code`,
      kind,
      type,
      content,
      design,
      folderId: folderId || null,
      customDomainId: customDomainId || null,
      slug: slug ? slugify(slug) : null,
      utm: hasUtm ? utmPayload : null,
      smartRules: kind === 'DYNAMIC' ? smartRules.filter((rule) => rule.matchValue && rule.url) : undefined,
      gates: {
        // An empty string clears the password; undefined leaves it untouched.
        password: passwordEnabled ? (password || undefined) : null,
        scheduleEnabled,
        scheduleStart: scheduleEnabled && scheduleStart ? new Date(scheduleStart).toISOString() : null,
        scheduleEnd: scheduleEnabled && scheduleEnd ? new Date(scheduleEnd).toISOString() : null,
        scanLimitEnabled,
        scanLimitMax: scanLimitEnabled ? Number(scanLimitMax) || null : null,
      },
    };
  }

  async function save(thenGoTo?: 'list' | 'stay') {
    setSaving(true);
    setErrors({});
    try {
      const body = buildBody();
      const response = await fetch(editing ? `/api/v1/qr/${initial?.id}` : '/api/v1/qr', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: Record<string, string>;
        data?: { id: string; shortLink: string | null };
      };

      if (!response.ok || !result.ok || !result.data) {
        if (result.fields) setErrors(result.fields);
        toast.error(result.error ?? 'Could not save the QR code');
        return;
      }

      setSavedId(result.data.id);
      setSavedLink(result.data.shortLink);
      toast.success(editing ? 'Changes saved' : 'QR code saved');

      if (thenGoTo === 'list') {
        router.push('/dashboard/codes');
        router.refresh();
        return;
      }
      if (!editing) {
        setStep('save');
        router.refresh();
      }
      // The button promises a download, so deliver one: a 1024 px PNG, rendered by the
      // server from the saved record. Other formats stay in the Download menu that now
      // sits where this button was.
      if (thenGoTo === 'stay' && !editing) {
        try {
          await downloadQrFile({ data: payload, design, name: body.name, qrCodeId: result.data.id, format: 'png', size: 1024 });
        } catch (error) {
          toast.error(`Saved, but the download failed: ${(error as Error).message}. Use the Download button to try again.`);
        }
      }
    } catch {
      toast.error('Network problem — your work is still on screen, try again.');
    } finally {
      setSaving(false);
    }
  }

  const stepIndex = STEPS.findIndex((item) => item.id === step);

  function goNext() {
    if (step === 'content' && missingRequired.length > 0) {
      toast.error(`Fill in: ${missingRequired.join(', ')}`);
      return;
    }
    const next = STEPS[Math.min(stepIndex + 1, STEPS.length - 1)];
    if (next.id === 'save' && !savedId) {
      void save('stay');
      return;
    }
    setStep(next.id);
  }

  const previewPanel = (
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">Live preview</p>
            <Badge variant="outline">{def?.label}</Badge>
          </div>

          <div className="flex justify-center rounded-2xl bg-surface-muted/60 p-4">
            <QrPreview
              data={payload}
              design={design}
              size={252}
              onRender={({ moduleCount: count }) => setModuleCount(count)}
            />
          </div>

          <ScanSafety design={design} moduleCount={moduleCount} compact />

          <div className="space-y-2">
            {savedId ? (
              <DownloadMenu
                request={{ data: payload, design, name, qrCodeId: savedId }}
                label="Download"
                className="w-full"
              />
            ) : (
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                disabled={!canSave}
                loading={saving}
                onClick={() => void save('stay')}
              >
                <Save /> Save and download
              </Button>
            )}
            {savedId ? (
              <Button variant="outline" className="w-full" loading={saving} onClick={() => void save('list')}>
                Save and close
              </Button>
            ) : null}
          </div>

          {kind === 'DYNAMIC' ? (
            <p className="flex items-start gap-1.5 text-[11.5px] leading-5 text-muted-foreground">
              <Globe className="mt-0.5 size-3 shrink-0" />
              Dynamic codes encode a short link, so the pattern stays simple and you keep control of the destination.
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-[11.5px] leading-5 text-muted-foreground">
              <KeyRound className="mt-0.5 size-3 shrink-0" />
              Static codes cannot be edited or tracked after printing. Switch to a dynamic type if you need either.
            </p>
          )}
        </Card>
  );

  // Each step starts at its top. On a phone the previous step leaves the page scrolled far
  // down, and the user would otherwise land in the middle of the next one.
  const topRef = React.useRef<HTMLDivElement>(null);
  const firstStep = React.useRef(true);
  React.useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const element = topRef.current;
    if (!element) return;
    const top = Math.max(0, element.getBoundingClientRect().top + window.scrollY - 76);
    if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: 'smooth' });
  }, [step]);

  const [previewOpen, setPreviewOpen] = React.useState(false);

  // The phone's bottom bar: the way back and the way forward, always within thumb reach.
  const back: (() => void) | null =
    step === 'content'
      ? editing
        ? null
        : () => setStep('type')
      : step === 'behaviour'
        ? () => setStep('content')
        : step === 'design'
          ? () => setStep('behaviour')
          : step === 'test'
            ? () => setStep('design')
            : null;
  const primary: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean } | null =
    step === 'type'
      ? { label: 'Continue', onClick: () => setStep('content') }
      : step === 'content'
        ? { label: 'Continue', onClick: goNext }
        : step === 'behaviour'
          ? { label: 'Next: design', onClick: () => setStep('design') }
          : step === 'design'
            ? { label: 'Preview and test', onClick: () => setStep('test') }
            : step === 'test'
              ? { label: editing ? 'Save changes' : 'Save QR code', onClick: () => void save('stay'), disabled: !canSave, loading: saving }
              : null;

  return (
    <div className="grid grid-cols-1 gap-5 pb-24 lg:grid-cols-[minmax(0,1fr)_352px] lg:pb-0">
      <div ref={topRef} className="min-w-0 space-y-5">
        {/* ------------------------------------------------------------ stepper */}
        <nav aria-label="Builder steps" className="overflow-x-auto">
          <p className="mb-2 text-[12.5px] font-medium text-muted-foreground sm:hidden">
            Step {stepIndex + 1} of {STEPS.length} · <span className="text-foreground">{STEPS[stepIndex]?.label}</span>
          </p>
          <ol className="flex min-w-max items-center gap-1.5">
            {STEPS.map((item, index) => {
              const active = item.id === step;
              const done = index < stepIndex;
              const disabled = editing && item.id === 'type';
              return (
                <li key={item.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setStep(item.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors sm:px-3',
                      active
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : done
                          ? 'bg-primary-soft text-primary-soft-foreground'
                          : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                      disabled && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded-md text-[11px] font-bold',
                        active ? 'bg-white/20' : done ? 'bg-primary/15' : 'bg-surface-muted',
                      )}
                    >
                      {done ? <Check className="size-3" /> : index + 1}
                    </span>
                    <span className={cn(!active && 'hidden sm:inline')}>{item.label}</span>
                  </button>
                  {index < STEPS.length - 1 ? <span className="hidden h-px w-3 bg-border sm:block" aria-hidden /> : null}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* --------------------------------------------------------------- type */}
        {step === 'type' ? (
          <Card className="p-5">
            <h2 className="mb-1 font-display text-[16px] font-semibold">What should this code do?</h2>
            <p className="mb-4 text-[13px] text-muted-foreground">
              Tap a type to continue. You can change the design and destination later — the printed pattern stays valid.
            </p>
            <TypePicker
              value={type}
              onChange={(nextType, nextDef) => {
                setType(nextType);
                setKind(nextDef.kind);
                setContent({});
                setErrors({});
                setStep('content');
              }}
              types={QR_TYPES}
            />
            <div className="mt-5 hidden justify-end lg:flex">
              <Button variant="brand" onClick={() => setStep('content')}>
                Continue <ArrowRight />
              </Button>
            </div>
          </Card>
        ) : null}

        {/* ------------------------------------------------------------ content */}
        {step === 'content' ? (
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-[16px] font-semibold">{def?.label} content</h2>
                <p className="text-[13px] text-muted-foreground">{def?.description}</p>
              </div>
              <Badge variant={kind === 'DYNAMIC' ? 'primary' : 'outline'}>
                {kind === 'DYNAMIC' ? 'Dynamic · editable' : 'Static · fixed'}
              </Badge>
            </div>

            <Field
              label="Name this code"
              htmlFor="qr-name"
              help="Internal label so you can find it later. Visitors never see it."
              className="mb-5"
            >
              <Input
                id="qr-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={`${def?.label ?? 'My'} code`}
                maxLength={120}
                invalid={Boolean(errors.name)}
              />
            </Field>

            <ContentForm
              type={type}
              value={content}
              onChange={patchContent}
              errors={errors}
              uploadFile={uploadFile}
            />

            <div className="mt-5 hidden items-center justify-between gap-2 lg:flex">
              {!editing ? (
                <Button variant="ghost" onClick={() => setStep('type')}>
                  <ArrowLeft /> Change type
                </Button>
              ) : (
                <span />
              )}
              <Button variant="brand" onClick={goNext}>
                Continue <ArrowRight />
              </Button>
            </div>
          </Card>
        ) : null}

        {/* ---------------------------------------------------------- behaviour */}
        {step === 'behaviour' ? (
          <div className="space-y-4">
            <Alert tone="info" title="Optional settings">
              Everything on this step is optional and the defaults work. Change what you need, or go straight on to
              the design.
            </Alert>
            <Card className="p-5">
              <h2 className="mb-4 font-display text-[16px] font-semibold">Where it lives</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Folder" help="Keeps your list tidy. Optional.">
                  <Select value={folderId || 'none'} onValueChange={(value) => setFolderId(value === 'none' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No folder</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {kind === 'DYNAMIC' ? (
                  <Field
                    label="Short domain"
                    help={
                      domains.length === 0
                        ? 'Add your own domain in My domains — it is free.'
                        : 'Only verified domains appear here.'
                    }
                  >
                    <Select
                      value={customDomainId || 'default'}
                      onValueChange={(value) => setCustomDomainId(value === 'default' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">{shortUrlBase.replace(/^https?:\/\//, '')} (default)</SelectItem>
                        {domains
                          .filter((domain) => domain.status === 'VERIFIED')
                          .map((domain) => (
                            <SelectItem key={domain.id} value={domain.id}>
                              {domain.host}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}

                {kind === 'DYNAMIC' ? (
                  <Field
                    label="Custom short link"
                    help="Letters, numbers, hyphen and underscore. Leave empty for a generated code."
                    error={errors.slug}
                    className="sm:col-span-2"
                  >
                    <Input
                      value={slug}
                      onChange={(event) => setSlug(event.target.value)}
                      placeholder="spring-sale"
                      prefix={
                        <span className="truncate">
                          {customDomainId
                            ? `${domains.find((item) => item.id === customDomainId)?.host ?? ''}/`
                            : `${shortUrlBase.replace(/^https?:\/\//, '')}/q/`}
                        </span>
                      }
                      invalid={Boolean(errors.slug)}
                    />
                  </Field>
                ) : null}
              </div>
            </Card>

            {kind === 'DYNAMIC' ? (
              <>
                <Card className="p-5">
                  <h2 className="mb-1 flex items-center gap-2 font-display text-[16px] font-semibold">
                    <Tag className="size-4 text-primary" /> Campaign tracking
                  </h2>
                  <p className="mb-4 text-[13px] text-muted-foreground">
                    UTM parameters are added to the destination so your own analytics can attribute the visit.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(
                      [
                        ['source', 'utm_source', 'qr-poster'],
                        ['medium', 'utm_medium', 'print'],
                        ['campaign', 'utm_campaign', 'spring-2026'],
                        ['term', 'utm_term', 'optional'],
                        ['content', 'utm_content', 'optional'],
                      ] as const
                    ).map(([key, label, placeholder]) => (
                      <Field key={key} label={label}>
                        <Input
                          value={(utm as Record<string, string>)[key] ?? ''}
                          onChange={(event) => setUtm((current) => ({ ...current, [key]: event.target.value }))}
                          placeholder={placeholder}
                        />
                      </Field>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-[13px] font-medium">Custom parameters</p>
                    {customParams.map((pair, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={pair.key}
                          onChange={(event) =>
                            setCustomParams((current) =>
                              current.map((item, i) => (i === index ? { ...item, key: event.target.value } : item)),
                            )
                          }
                          placeholder="key"
                        />
                        <Input
                          value={pair.value}
                          onChange={(event) =>
                            setCustomParams((current) =>
                              current.map((item, i) => (i === index ? { ...item, value: event.target.value } : item)),
                            )
                          }
                          placeholder="value"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCustomParams((current) => current.filter((_, i) => i !== index))}
                          aria-label="Remove parameter"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomParams((current) => [...current, { key: '', value: '' }])}
                      disabled={customParams.length >= 12}
                    >
                      <Plus /> Add parameter
                    </Button>
                  </div>
                </Card>

                <Card className="p-5">
                  <h2 className="mb-1 flex items-center gap-2 font-display text-[16px] font-semibold">
                    <Shuffle className="size-4 text-primary" /> Smart routing
                    <InfoHint>
                      Rules are checked in order: time, device, country, then language. If none match, the default
                      destination is used.
                    </InfoHint>
                  </h2>
                  <p className="mb-4 text-[13px] text-muted-foreground">
                    Send different people to different places from the same printed code. Optional.
                  </p>

                  {smartRules.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-surface-muted/50 px-3 py-4 text-center text-[12.5px] text-muted-foreground">
                      No rules yet — everyone goes to the default destination.
                    </p>
                  ) : null}

                  <div className="space-y-2.5">
                    {smartRules.map((rule, index) => (
                      <div key={index} className="rounded-xl border border-border bg-surface p-3">
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[150px_1fr_1fr_auto]">
                          <Select
                            value={rule.kind}
                            onValueChange={(value) =>
                              setSmartRules((current) =>
                                current.map((item, i) =>
                                  i === index ? { ...item, kind: value as SmartRule['kind'], matchValue: '' } : item,
                                ),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COUNTRY">Country is</SelectItem>
                              <SelectItem value="LANGUAGE">Language is</SelectItem>
                              <SelectItem value="DEVICE">Device is</SelectItem>
                              <SelectItem value="TIME">Time is</SelectItem>
                            </SelectContent>
                          </Select>

                          {rule.kind === 'DEVICE' ? (
                            <Select
                              value={rule.matchValue || 'mobile'}
                              onValueChange={(value) =>
                                setSmartRules((current) =>
                                  current.map((item, i) => (i === index ? { ...item, matchValue: value } : item)),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DEVICE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={rule.matchValue}
                              onChange={(event) =>
                                setSmartRules((current) =>
                                  current.map((item, i) =>
                                    i === index ? { ...item, matchValue: event.target.value } : item,
                                  ),
                                )
                              }
                              placeholder={
                                rule.kind === 'COUNTRY'
                                  ? 'PK, AE, GB'
                                  : rule.kind === 'LANGUAGE'
                                    ? 'ur, en-GB'
                                    : 'mon,tue 09:00-17:00'
                              }
                            />
                          )}

                          <Input
                            value={rule.url}
                            onChange={(event) =>
                              setSmartRules((current) =>
                                current.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)),
                              )
                            }
                            placeholder="https://destination"
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSmartRules((current) => current.filter((_, i) => i !== index))}
                            aria-label="Remove rule"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      setSmartRules((current) => [
                        ...current,
                        { kind: 'COUNTRY', matchValue: '', url: '', priority: current.length + 1 },
                      ])
                    }
                    disabled={smartRules.length >= 40}
                  >
                    <Plus /> Add a rule
                  </Button>
                </Card>

                <Card className="p-5">
                  <h2 className="mb-1 font-display text-[16px] font-semibold">Access controls</h2>
                  <Alert tone="info" className="mb-4">
                    Every control here is optional and off by default. Nothing switches your code off on its own.
                  </Alert>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-border p-3.5">
                      <SwitchRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <Lock className="size-3.5" /> Password protection
                          </span>
                        }
                        description="Visitors must enter a password before the code resolves."
                        checked={passwordEnabled}
                        onCheckedChange={setPasswordEnabled}
                      />
                      {passwordEnabled ? (
                        <Field
                          className="mt-3"
                          label={initial?.passwordProtected ? 'New password (leave empty to keep the current one)' : 'Password'}
                        >
                          <Input
                            type="text"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Share this with the people who should get in"
                            autoComplete="off"
                          />
                        </Field>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-border p-3.5">
                      <SwitchRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <CalendarClock className="size-3.5" /> Schedule
                          </span>
                        }
                        description="Only resolve between the dates you choose."
                        checked={scheduleEnabled}
                        onCheckedChange={setScheduleEnabled}
                      />
                      {scheduleEnabled ? (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Field label="Starts">
                            <Input
                              type="datetime-local"
                              value={scheduleStart}
                              onChange={(event) => setScheduleStart(event.target.value)}
                            />
                          </Field>
                          <Field label="Ends" help="Leave empty to run indefinitely.">
                            <Input
                              type="datetime-local"
                              value={scheduleEnd}
                              onChange={(event) => setScheduleEnd(event.target.value)}
                            />
                          </Field>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-border p-3.5">
                      <SwitchRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <Gauge className="size-3.5" /> Scan limit
                          </span>
                        }
                        description="Stop resolving after a number of scans you set."
                        checked={scanLimitEnabled}
                        onCheckedChange={setScanLimitEnabled}
                      />
                      {scanLimitEnabled ? (
                        <Field className="mt-3" label="Maximum scans">
                          <Input
                            type="number"
                            min={1}
                            value={scanLimitMax}
                            onChange={(event) => setScanLimitMax(event.target.value)}
                          />
                        </Field>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Alert tone="info" title="Static codes have no behaviour settings">
                The content is baked into the pattern, so there is nothing to schedule, protect or route. Switch to a
                dynamic type if you need those.
              </Alert>
            )}

            <div className="hidden items-center justify-between gap-2 lg:flex">
              <Button variant="ghost" onClick={() => setStep('content')}>
                <ArrowLeft /> Back
              </Button>
              <Button variant="brand" onClick={() => setStep('design')}>
                Continue to design <ArrowRight />
              </Button>
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------------- design */}
        {step === 'design' ? (
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-[16px] font-semibold">Make it yours</h2>
                <p className="text-[13px] text-muted-foreground">
                  The preview is the file you download — nothing is approximated.
                </p>
              </div>
              {templates.length > 0 ? (
                <Select
                  onValueChange={(value) => {
                    const template = templates.find((item) => item.id === value);
                    if (template) {
                      setDesign({ ...DEFAULT_DESIGN, ...template.design });
                      toast.success(`Applied “${template.name}”`);
                    }
                  }}
                >
                  <SelectTrigger className="w-[13rem]">
                    <SelectValue placeholder="Apply a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        {template.isDefault ? ' (default)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>

            <DesignEditor design={design} onChange={patchDesign} uploadLogo={uploadLogo} brandColors={brandColors} />

            <div className="mt-5 hidden items-center justify-between gap-2 lg:flex">
              <Button variant="ghost" onClick={() => setStep('behaviour')}>
                <ArrowLeft /> Back
              </Button>
              <Button variant="brand" onClick={() => setStep('test')}>
                Preview and test <ArrowRight />
              </Button>
            </div>
          </Card>
        ) : null}

        {/* --------------------------------------------------------------- test */}
        {step === 'test' ? (
          <Card className="p-5">
            <h2 className="mb-1 font-display text-[16px] font-semibold">Test before you print</h2>
            <p className="mb-4 text-[13px] text-muted-foreground">
              Scan the preview with your phone camera. For dynamic codes the real short link is created when you save.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
                <p className="mb-2 text-[12.5px] font-medium">What the code encodes</p>
                <p className="break-all rounded-lg bg-card p-2.5 font-mono text-[11.5px] leading-5">
                  {payload || 'Nothing yet — add your content.'}
                </p>
              </div>

              <div className="space-y-2.5">
                <ScanSafety design={design} moduleCount={moduleCount} />
                {kind === 'DYNAMIC' && savedLink ? (
                  <Button asChild variant="outline" className="w-full">
                    <a href={`${savedLink}?preview=1`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink /> Open the destination (not counted as a scan)
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            {missingRequired.length > 0 ? (
              <Alert tone="warning" className="mt-4" title="Still missing">
                {missingRequired.join(', ')}
              </Alert>
            ) : null}

            <div className="mt-5 hidden items-center justify-between gap-2 lg:flex">
              <Button variant="ghost" onClick={() => setStep('design')}>
                <ArrowLeft /> Back to design
              </Button>
              <Button variant="brand" disabled={!canSave} loading={saving} onClick={() => void save('stay')}>
                <Save /> {editing ? 'Save changes' : 'Save QR code'}
              </Button>
            </div>
          </Card>
        ) : null}

        {/* --------------------------------------------------------------- save */}
        {step === 'save' ? (
          <Card className="p-5">
            <div className="flex flex-col items-center py-4 text-center">
              <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-success/12 text-success">
                <Check className="size-6" />
              </span>
              <h2 className="font-display text-[19px] font-semibold tracking-[-0.01em]">
                {editing ? 'Changes saved' : 'Your QR code is live'}
              </h2>
              <p className="mt-1.5 max-w-md text-[13.5px] leading-6 text-muted-foreground">
                {kind === 'DYNAMIC'
                  ? 'The short link below is what the pattern points at. You can change the destination any time without reprinting — and it will not expire.'
                  : 'This static code holds its content directly, so it works offline and forever.'}
              </p>
            </div>

            {savedLink ? <CopyField label="Short link" value={savedLink} className="mb-4" /> : null}

            <div className="flex flex-wrap items-center justify-center gap-2">
              {savedId ? (
                <DownloadMenu request={{ data: payload, design, name, qrCodeId: savedId }} label="Download" />
              ) : null}
              <Button asChild variant="outline">
                <Link href={savedId ? `/dashboard/codes/${savedId}` : '/dashboard/codes'}>Open details</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/dashboard/new">Create another</Link>
              </Button>
            </div>
          </Card>
        ) : null}
      </div>

      {/* ------------------------------------------------------------- preview */}
      <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">{previewPanel}</div>

      {/* ---------------------------------------------- phone: actions always in reach */}
      {primary ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-2">
            {back ? (
              <Button variant="outline" size="icon" aria-label="Back" onClick={back}>
                <ArrowLeft />
              </Button>
            ) : null}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              aria-label="Show the live preview"
              className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-card pl-1 pr-2.5 text-[12.5px] font-medium"
            >
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-white">
                {payload ? (
                  <QrPreview data={payload} design={design} size={32} bare />
                ) : (
                  <QrCode className="size-4 text-muted-foreground" />
                )}
              </span>
              Preview
            </button>
            <Button
              variant="brand"
              className="min-w-0 flex-1"
              disabled={primary.disabled}
              loading={primary.loading}
              onClick={primary.onClick}
            >
              <span className="truncate">{primary.label}</span>
              {step === 'test' ? <Save /> : <ArrowRight />}
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90dvh] max-w-sm overflow-y-auto">
          {/* The panel carries its own "Live preview" heading; this one is for screen readers. */}
          <DialogHeader className="sr-only">
            <DialogTitle>Live preview</DialogTitle>
            <DialogDescription>Exactly the file you download.</DialogDescription>
          </DialogHeader>
          {previewPanel}
        </DialogContent>
      </Dialog>
    </div>
  );
}
