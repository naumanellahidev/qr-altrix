'use client';

import * as React from 'react';
import { FileUp, GripVertical, Lock, Plus, Trash2, X } from 'lucide-react';
import { getTypeDef, type FieldDef } from '@/lib/qr/catalog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ColorInput } from '@/components/qr/color-input';
import { toast } from 'sonner';

export interface UploadedRef {
  url: string;
  name?: string;
  size?: number;
  caption?: string;
}

export interface ContentFormProps {
  type: string;
  value: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  /** Uploads a file and returns a stored reference. Omit to lock file fields. */
  uploadFile?: (file: File, field: FieldDef) => Promise<UploadedRef>;
  /** Called when a visitor without an account touches a feature that needs one. */
  onRequireAccount?: (reason: string) => void;
  className?: string;
}

function FileDrop({
  field,
  current,
  multiple,
  uploadFile,
  onRequireAccount,
  onChange,
}: {
  field: FieldDef;
  current: UploadedRef[] | UploadedRef | null;
  multiple: boolean;
  uploadFile?: ContentFormProps['uploadFile'];
  onRequireAccount?: ContentFormProps['onRequireAccount'];
  onChange: (value: unknown) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const list = Array.isArray(current) ? current : current ? [current] : [];

  async function accept(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!uploadFile) {
      onRequireAccount?.('Create a free account to upload files — your design is kept.');
      return;
    }
    setBusy(true);
    try {
      const uploaded: UploadedRef[] = [];
      for (const file of Array.from(files).slice(0, multiple ? (field.max ?? 20) : 1)) {
        uploaded.push(await uploadFile(file, field));
      }
      onChange(multiple ? [...list, ...uploaded].slice(0, field.max ?? 40) : uploaded[0]);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void accept(event.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors',
          dragging ? 'border-primary bg-primary-soft/60' : 'border-border bg-surface-muted/50',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={field.accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => void accept(event.target.files)}
        />
        {uploadFile ? (
          <FileUp className="size-5 text-muted-foreground" aria-hidden />
        ) : (
          <Lock className="size-5 text-muted-foreground" aria-hidden />
        )}
        <p className="text-[13px] font-medium">
          {uploadFile ? 'Drop a file here or choose one' : 'Free account needed to upload'}
        </p>
        <p className="max-w-xs text-[12px] leading-5 text-muted-foreground">
          {uploadFile
            ? `${field.accept?.replace('application/', '').replace('/*', ' files') ?? 'Any file'} · stored on your own server`
            : 'Sign up in two fields and your design carries over.'}
        </p>
        <Button
          type="button"
          size="sm"
          variant={uploadFile ? 'outline' : 'brand'}
          loading={busy}
          onClick={() =>
            uploadFile
              ? inputRef.current?.click()
              : onRequireAccount?.('Create a free account to upload files — your design is kept.')
          }
        >
          {uploadFile ? 'Choose file' : 'Create free account'}
        </Button>
      </div>

      {list.length > 0 ? (
        <ul className="space-y-1.5">
          {list.map((item, index) => (
            <li
              key={`${item.url}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px]"
            >
              <span className="min-w-0 flex-1 truncate">{item.name ?? item.url.split('/').pop()}</span>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                onClick={() =>
                  onChange(multiple ? list.filter((_, i) => i !== index) : null)
                }
                aria-label="Remove file"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Repeater({
  field,
  rows,
  onChange,
}: {
  field: FieldDef;
  rows: Record<string, unknown>[];
  onChange: (rows: Record<string, unknown>[]) => void;
}) {
  function update(index: number, patch: Record<string, unknown>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface-muted/50 px-3 py-4 text-center text-[12.5px] text-muted-foreground">
          Nothing added yet.
        </p>
      ) : null}

      {rows.map((row, index) => (
        <div key={index} className="rounded-xl border border-border bg-surface p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
              <GripVertical className="size-3.5" />
              {index + 1}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
                aria-label="Move down"
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label="Remove"
              >
                <Trash2 />
              </Button>
            </div>
          </div>

          <div className={cn('grid gap-2.5', (field.itemFields?.length ?? 0) > 1 && 'sm:grid-cols-2')}>
            {(field.itemFields ?? []).map((sub) => (
              <Field key={sub.name} label={sub.label}>
                {sub.type === 'select' ? (
                  <Select
                    value={String(row[sub.name] ?? sub.options?.[0]?.value ?? '')}
                    onValueChange={(value) => update(index, { [sub.name]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {(sub.options ?? []).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : sub.type === 'switch' ? (
                  <Switch
                    checked={Boolean(row[sub.name])}
                    onCheckedChange={(checked) => update(index, { [sub.name]: checked })}
                  />
                ) : sub.type === 'textarea' ? (
                  <Textarea
                    value={String(row[sub.name] ?? '')}
                    onChange={(event) => update(index, { [sub.name]: event.target.value })}
                    placeholder={sub.placeholder}
                  />
                ) : (
                  <Input
                    type={sub.type === 'url' ? 'text' : sub.type === 'time' ? 'time' : sub.type}
                    value={String(row[sub.name] ?? '')}
                    onChange={(event) => update(index, { [sub.name]: event.target.value })}
                    placeholder={sub.placeholder ?? (sub.type === 'url' ? 'https://' : undefined)}
                  />
                )}
              </Field>
            ))}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...rows, {}])}
        disabled={rows.length >= (field.max ?? 50)}
      >
        <Plus /> Add {field.label.toLowerCase().replace(/s$/, '')}
      </Button>
    </div>
  );
}

/**
 * Renders the content step of the builder straight from the type catalogue, so every
 * QR type gets a consistent, validated form without bespoke code.
 */
export function ContentForm({
  type,
  value,
  onChange,
  errors = {},
  uploadFile,
  onRequireAccount,
  className,
}: ContentFormProps) {
  const def = getTypeDef(type);
  if (!def) return null;

  const groups = new Map<string, FieldDef[]>();
  for (const field of def.fields) {
    const key = field.group ?? '';
    const list = groups.get(key) ?? [];
    list.push(field);
    groups.set(key, list);
  }

  function renderField(field: FieldDef) {
    const fieldId = `content-${field.name}`;
    const error = errors[field.name];
    const current = value[field.name];

    const control = (() => {
      switch (field.type) {
        case 'textarea':
          return (
            <Textarea
              id={fieldId}
              value={String(current ?? '')}
              onChange={(event) => onChange({ [field.name]: event.target.value })}
              placeholder={field.placeholder}
              invalid={Boolean(error)}
              maxLength={field.max ?? 5000}
              rows={field.name === 'items' ? 5 : 3}
            />
          );
        case 'select':
          return (
            <Select
              value={String(current ?? field.defaultValue ?? field.options?.[0]?.value ?? '')}
              onValueChange={(next) => onChange({ [field.name]: next })}
            >
              <SelectTrigger id={fieldId} invalid={Boolean(error)}>
                <SelectValue placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'switch':
          return (
            <div className="flex h-10 items-center">
              <Switch
                id={fieldId}
                checked={current === undefined ? Boolean(field.defaultValue) : Boolean(current)}
                onCheckedChange={(checked) => onChange({ [field.name]: checked })}
              />
            </div>
          );
        case 'color':
          return (
            <ColorInput
              value={String(current ?? field.defaultValue ?? '#4F46E5')}
              onChange={(next) => onChange({ [field.name]: next })}
            />
          );
        case 'file':
        case 'files':
          return (
            <FileDrop
              field={field}
              multiple={field.type === 'files'}
              current={(current as UploadedRef[] | UploadedRef | null) ?? null}
              uploadFile={uploadFile}
              onRequireAccount={onRequireAccount}
              onChange={(next) => onChange({ [field.name]: next })}
            />
          );
        case 'repeater':
          return (
            <Repeater
              field={field}
              rows={(Array.isArray(current) ? current : []) as Record<string, unknown>[]}
              onChange={(rows) => onChange({ [field.name]: rows })}
            />
          );
        default:
          return (
            <Input
              id={fieldId}
              type={
                field.type === 'datetime'
                  ? 'datetime-local'
                  : field.type === 'url'
                    ? 'text'
                    : field.type === 'tel'
                      ? 'tel'
                      : field.type
              }
              inputMode={field.type === 'number' ? 'decimal' : undefined}
              value={String(current ?? field.defaultValue ?? '')}
              onChange={(event) => onChange({ [field.name]: event.target.value })}
              placeholder={field.placeholder ?? (field.type === 'url' ? 'https://' : undefined)}
              invalid={Boolean(error)}
              autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'}
            />
          );
      }
    })();

    const isWide =
      field.type === 'textarea' || field.type === 'repeater' || field.type === 'files' || field.type === 'file';

    return (
      <Field
        key={field.name}
        label={field.label}
        htmlFor={fieldId}
        required={field.required}
        help={field.help}
        error={error}
        className={isWide ? 'sm:col-span-2' : undefined}
      >
        {control}
      </Field>
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      {Array.from(groups.entries()).map(([group, fields]) => (
        <div key={group || 'default'} className="space-y-3">
          {group ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map(renderField)}</div>
        </div>
      ))}
    </div>
  );
}
