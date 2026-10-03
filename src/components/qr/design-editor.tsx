'use client';

import * as React from 'react';
import {
  Blend, Frame, ImagePlus, Palette, Settings2, Shapes, Sparkles, Trash2, Upload, X,
} from 'lucide-react';
import { renderQr } from '@/lib/qr/render';
import {
  BODY_SHAPES, COLOR_PRESETS, EYE_BALL_SHAPES, EYE_FRAME_SHAPES, FRAME_PRESETS, LOGO_PRESETS,
  logoPresetDataUri,
} from '@/lib/qr/presets';
import type { QrDesign } from '@/lib/qr/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SliderField } from '@/components/ui/slider';
import { SwitchRow } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoHint } from '@/components/ui/tooltip';
import { ColorInput } from '@/components/qr/color-input';
import { toast } from 'sonner';

const SAMPLE_PAYLOAD = 'https://qr-altrix.app/sample';

export interface DesignEditorProps {
  design: QrDesign;
  onChange: (patch: Partial<QrDesign>) => void;
  /** Uploads a logo and returns the URL to store. Falls back to a data URI when absent. */
  uploadLogo?: (file: File) => Promise<string>;
  /** Workspace brand colours offered as one-click swatches. */
  brandColors?: string[];
  className?: string;
  compact?: boolean;
}

/** Tiny QR rendered with one shape setting changed, used as a visual swatch. */
function ShapeSwatch({ design, patch, selected }: { design: QrDesign; patch: Partial<QrDesign>; selected: boolean }) {
  const svg = React.useMemo(() => {
    try {
      return renderQr(SAMPLE_PAYLOAD, {
        ...design,
        ...patch,
        frame: 'none',
        ctaText: null,
        margin: 1,
        logoUrl: null,
        logoPreset: null,
        gradientEnabled: false,
        fgColor: selected ? design.fgColor : '#334155',
        bgColor: '#FFFFFF',
        transparentBg: false,
        invert: false,
      }, { size: 92, bare: true }).svg;
    } catch {
      return '';
    }
  }, [design, patch, selected]);

  return (
    <span
      className="pointer-events-none block size-11 overflow-hidden rounded-md bg-white"
      dangerouslySetInnerHTML={{ __html: svg.replace(/width="\d+" height="\d+"/, 'width="44" height="44"') }}
    />
  );
}

function OptionGrid<T extends string>({
  options,
  value,
  onSelect,
  renderSwatch,
  columns = 4,
}: {
  options: { value: T; label: string }[];
  value: T;
  onSelect: (value: T) => void;
  renderSwatch: (option: T, selected: boolean) => React.ReactNode;
  columns?: number;
}) {
  return (
    <div className={cn('grid gap-2', columns === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={selected}
            title={option.label}
            className={cn(
              'group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all',
              selected
                ? 'border-primary bg-primary-soft/70 shadow-soft'
                : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-muted',
            )}
          >
            {renderSwatch(option.value, selected)}
            <span
              className={cn(
                'line-clamp-1 text-[10.5px] leading-3',
                selected ? 'font-medium text-primary' : 'text-muted-foreground',
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function DesignEditor({ design, onChange, uploadLogo, brandColors, className, compact }: DesignEditorProps) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function handleLogoFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Logo must be 3 MB or smaller');
      return;
    }
    if (!/^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(file.type)) {
      toast.error('Use a PNG, JPG, WebP or SVG image');
      return;
    }
    setUploading(true);
    try {
      if (uploadLogo) {
        const url = await uploadLogo(file);
        onChange({ logoUrl: url, logoPreset: null });
      } else {
        // No account yet (homepage): keep the logo in the draft as a data URI.
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Could not read that file'));
          reader.readAsDataURL(file);
        });
        onChange({ logoUrl: dataUri, logoPreset: null });
      }
      if (design.logoShape === 'none') onChange({ logoShape: 'rounded' });
      toast.success('Logo added');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const framesByGroup = React.useMemo(() => {
    const groups = new Map<string, typeof FRAME_PRESETS>();
    for (const preset of FRAME_PRESETS) {
      const list = groups.get(preset.group) ?? [];
      list.push(preset);
      groups.set(preset.group, list);
    }
    return Array.from(groups.entries());
  }, []);

  const activeFrame = FRAME_PRESETS.find((f) => f.id === design.frame) ?? FRAME_PRESETS[0];

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs defaultValue="shape">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="shape">
            <Shapes /> {compact ? null : 'Shape'}
          </TabsTrigger>
          <TabsTrigger value="colour">
            <Palette /> {compact ? null : 'Colour'}
          </TabsTrigger>
          <TabsTrigger value="logo">
            <ImagePlus /> {compact ? null : 'Logo'}
          </TabsTrigger>
          <TabsTrigger value="frame">
            <Frame /> {compact ? null : 'Frame'}
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings2 /> {compact ? null : 'Advanced'}
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------------- shape */}
        <TabsContent value="shape" className="space-y-5 pt-4">
          <div className="space-y-2">
            <p className="text-[13px] font-medium">Pattern style</p>
            <OptionGrid
              options={BODY_SHAPES}
              value={design.bodyShape}
              onSelect={(bodyShape) => onChange({ bodyShape })}
              renderSwatch={(option, selected) => (
                <ShapeSwatch design={design} patch={{ bodyShape: option }} selected={selected} />
              )}
            />
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-[13px] font-medium">
              Corner frame
              <InfoHint>The three big squares scanners use to find and orient the code.</InfoHint>
            </p>
            <OptionGrid
              options={EYE_FRAME_SHAPES}
              value={design.eyeFrameShape}
              onSelect={(eyeFrameShape) => onChange({ eyeFrameShape })}
              renderSwatch={(option, selected) => (
                <ShapeSwatch design={design} patch={{ eyeFrameShape: option }} selected={selected} />
              )}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-medium">Corner centre</p>
            <OptionGrid
              options={EYE_BALL_SHAPES}
              value={design.eyeBallShape}
              onSelect={(eyeBallShape) => onChange({ eyeBallShape })}
              renderSwatch={(option, selected) => (
                <ShapeSwatch design={design} patch={{ eyeBallShape: option }} selected={selected} />
              )}
            />
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------ colour */}
        <TabsContent value="colour" className="space-y-5 pt-4">
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-[13px] font-medium">
              <Sparkles className="size-3.5 text-primary" /> Quick looks
            </p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() =>
                    onChange({
                      fgColor: preset.fg,
                      bgColor: preset.bg,
                      gradientEnabled: Boolean(preset.gradientTo),
                      gradientFrom: preset.fg,
                      gradientTo: preset.gradientTo ?? preset.fg,
                      invert: false,
                      transparentBg: false,
                    })
                  }
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[12px] transition-all hover:shadow-soft',
                    design.fgColor.toUpperCase() === preset.fg.toUpperCase() &&
                      design.bgColor.toUpperCase() === preset.bg.toUpperCase()
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border bg-surface',
                  )}
                >
                  <span
                    className="size-4 rounded-full border border-black/10"
                    style={{
                      background: preset.gradientTo
                        ? `linear-gradient(135deg, ${preset.fg}, ${preset.gradientTo})`
                        : preset.fg,
                    }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {brandColors && brandColors.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[13px] font-medium">Brand kit</p>
              <div className="flex flex-wrap gap-2">
                {brandColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange({ fgColor: color })}
                    title={color}
                    className="size-8 rounded-lg border border-border shadow-soft transition-transform hover:scale-105"
                    style={{ background: color }}
                  >
                    <span className="sr-only">Use {color}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <ColorInput
              label="Pattern colour"
              value={design.fgColor}
              onChange={(fgColor) => onChange({ fgColor })}
              disabled={design.gradientEnabled}
            />
            <ColorInput
              label="Background"
              value={design.bgColor}
              onChange={(bgColor) => onChange({ bgColor })}
              disabled={design.transparentBg}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-surface-muted/50 p-3.5">
            <SwitchRow
              label={
                <span className="flex items-center gap-1.5">
                  <Blend className="size-3.5" /> Gradient
                </span>
              }
              description="Blend two colours across the pattern."
              checked={design.gradientEnabled}
              onCheckedChange={(gradientEnabled) => onChange({ gradientEnabled })}
            />
            {design.gradientEnabled ? (
              <div className="space-y-3 pt-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ColorInput
                    label="From"
                    value={design.gradientFrom}
                    onChange={(gradientFrom) => onChange({ gradientFrom })}
                  />
                  <ColorInput label="To" value={design.gradientTo} onChange={(gradientTo) => onChange({ gradientTo })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Type">
                    <Select
                      value={design.gradientType}
                      onValueChange={(value) => onChange({ gradientType: value as QrDesign['gradientType'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="radial">Radial</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  {design.gradientType === 'linear' ? (
                    <SliderField
                      label="Angle"
                      value={design.gradientRotation}
                      onChange={(gradientRotation) => onChange({ gradientRotation })}
                      min={0}
                      max={360}
                      suffix="°"
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-surface-muted/50 p-3.5">
            <SwitchRow
              label="Transparent background"
              description="Place the code over your own artwork. Keep the surface plain and light."
              checked={design.transparentBg}
              onCheckedChange={(transparentBg) => onChange({ transparentBg })}
            />
            <SwitchRow
              label="Invert colours"
              description="Light pattern on a dark background. Test before printing a large run."
              checked={design.invert}
              onCheckedChange={(invert) => onChange({ invert })}
            />
          </div>

          <details className="group rounded-xl border border-border bg-surface p-3.5">
            <summary className="cursor-pointer text-[13px] font-medium">Colour the corners separately</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ColorInput
                label="Corner frame"
                value={design.eyeColor ?? design.fgColor}
                onChange={(eyeColor) => onChange({ eyeColor })}
              />
              <ColorInput
                label="Corner centre"
                value={design.eyeBallColor ?? design.eyeColor ?? design.fgColor}
                onChange={(eyeBallColor) => onChange({ eyeBallColor })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground"
                onClick={() => onChange({ eyeColor: null, eyeBallColor: null })}
              >
                <X /> Match the pattern colour
              </Button>
            </div>
          </details>
        </TabsContent>

        {/* -------------------------------------------------------------- logo */}
        <TabsContent value="logo" className="space-y-5 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={(event) => void handleLogoFile(event.target.files?.[0])}
            />
            <Button type="button" variant="outline" loading={uploading} onClick={() => fileRef.current?.click()}>
              <Upload /> Upload logo
            </Button>
            {design.logoUrl || design.logoPreset ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => onChange({ logoUrl: null, logoPreset: null, logoShape: 'none' })}
              >
                <Trash2 /> Remove
              </Button>
            ) : null}
            <span className="text-[12px] text-muted-foreground">PNG, JPG, WebP or SVG · up to 3 MB</span>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-medium">Or pick a built-in icon</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {LOGO_PRESETS.map((preset) => {
                const selected = design.logoPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    onClick={() =>
                      onChange({
                        logoPreset: selected ? null : preset.id,
                        logoUrl: null,
                        logoShape: selected ? 'none' : design.logoShape === 'none' ? 'circle' : design.logoShape,
                      })
                    }
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-xl border p-2 transition-all',
                      selected
                        ? 'border-primary bg-primary-soft shadow-soft'
                        : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-muted',
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                      <path d={preset.path} fill={preset.color} />
                    </svg>
                    <span className="sr-only">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {design.logoUrl || design.logoPreset ? (
            <div className="space-y-4 rounded-xl border border-border bg-surface-muted/50 p-3.5">
              <SliderField
                label="Logo size"
                value={design.logoSize}
                onChange={(logoSize) => onChange({ logoSize })}
                min={8}
                max={34}
                suffix="%"
                help={design.logoSize > 25 ? 'Above 25% you should raise error correction to Q or H.' : undefined}
              />
              <SliderField
                label="Clear space around logo"
                value={design.logoPadding}
                onChange={(logoPadding) => onChange({ logoPadding })}
                min={0}
                max={24}
              />
              <Field label="Backing shape">
                <Select
                  value={design.logoShape}
                  onValueChange={(value) => onChange({ logoShape: value as QrDesign['logoShape'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="rounded">Rounded square</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="ribbon">Wide band</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          ) : null}
        </TabsContent>

        {/* ------------------------------------------------------------- frame */}
        <TabsContent value="frame" className="space-y-5 pt-4">
          <div className="space-y-3">
            {framesByGroup.map(([group, presets]) => (
              <div key={group} className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          frame: preset.id,
                          ctaText:
                            preset.defaultCta && (!design.ctaText || design.ctaText === activeFrame.defaultCta)
                              ? preset.defaultCta
                              : design.ctaText,
                        })
                      }
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-[12px] transition-all',
                        design.frame === preset.id
                          ? 'border-primary bg-primary-soft font-medium text-primary'
                          : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-muted',
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {design.frame !== 'none' ? (
            <div className="space-y-4 rounded-xl border border-border bg-surface-muted/50 p-3.5">
              <Field label="Call to action" help="Short and direct works best — four words or fewer.">
                <Input
                  value={design.ctaText ?? ''}
                  onChange={(event) => onChange({ ctaText: event.target.value })}
                  placeholder={activeFrame.defaultCta ?? 'SCAN ME'}
                  maxLength={40}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorInput label="Frame colour" value={design.frameColor} onChange={(frameColor) => onChange({ frameColor })} />
                <ColorInput
                  label="Text colour"
                  value={design.frameTextColor}
                  onChange={(frameTextColor) => onChange({ frameTextColor })}
                />
              </div>
              <Field label="Text position">
                <Select
                  value={design.ctaPosition}
                  onValueChange={(value) => onChange({ ctaPosition: value as QrDesign['ctaPosition'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom">Below the code</SelectItem>
                    <SelectItem value="top">Above the code</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          ) : null}
        </TabsContent>

        {/* ---------------------------------------------------------- advanced */}
        <TabsContent value="advanced" className="space-y-5 pt-4">
          <SliderField
            label="Quiet zone"
            value={design.margin}
            onChange={(margin) => onChange({ margin })}
            min={0}
            max={12}
            help="Clear space around the code. 4 is the standard; below 2 some scanners struggle."
          />

          <Field
            label="Error correction"
            help="Higher levels survive scratches and bigger logos, but make the pattern denser."
          >
            <Select
              value={design.errorCorrection}
              onValueChange={(value) => onChange({ errorCorrection: value as QrDesign['errorCorrection'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L — recovers ~7% (smallest pattern)</SelectItem>
                <SelectItem value="M">M — recovers ~15% (recommended)</SelectItem>
                <SelectItem value="Q">Q — recovers ~25% (logos, outdoor use)</SelectItem>
                <SelectItem value="H">H — recovers ~30% (harsh conditions)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { logoPresetDataUri };
