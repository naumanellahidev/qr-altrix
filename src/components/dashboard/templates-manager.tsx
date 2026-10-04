'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Palette, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { DEFAULT_DESIGN, type QrDesign } from '@/lib/qr/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm';
import { DesignEditor } from '@/components/qr/design-editor';
import { QrPreview } from '@/components/qr/qr-preview';
import { toast } from 'sonner';
import { useDateFormat, DATE, DATE_TIME, TIME } from '@/lib/hooks/use-date-format';

const SAMPLE = 'https://qr-altrix.app/template-preview';

export interface TemplateRow {
  id: string;
  name: string;
  isDefault: boolean;
  design: Partial<QrDesign>;
  updatedAt: string;
}

export function TemplatesManager({
  templates,
  canManage,
  brandColors,
}: {
  templates: TemplateRow[];
  canManage: boolean;
  brandColors: string[];
}) {
  const formatDate = useDateFormat();
  const router = useRouter();
  const [editing, setEditing] = React.useState<TemplateRow | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState('');
  const [design, setDesign] = React.useState<QrDesign>({ ...DEFAULT_DESIGN });
  const [makeDefault, setMakeDefault] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [deleting, setDeleting] = React.useState<TemplateRow | null>(null);

  function openCreate() {
    setName('');
    setDesign({ ...DEFAULT_DESIGN });
    setMakeDefault(templates.length === 0);
    setCreating(true);
  }

  function openEdit(template: TemplateRow) {
    setName(template.name);
    setDesign({ ...DEFAULT_DESIGN, ...template.design });
    setMakeDefault(template.isDefault);
    setEditing(template);
  }

  async function save() {
    if (!name.trim()) {
      toast.error('Give the template a name');
      return;
    }
    setBusy(true);
    try {
      const body = { name: name.trim(), design, isDefault: makeDefault };
      const response = await fetch(editing ? `/api/v1/templates/${editing.id}` : '/api/v1/templates', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? 'Could not save the template');
        return;
      }
      toast.success(editing ? 'Template updated' : 'Template created');
      setEditing(null);
      setCreating(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(template: TemplateRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/templates/${template.id}`, { method: 'POST' });
      if (!response.ok) {
        toast.error('Could not duplicate the template');
        return;
      }
      toast.success('Template duplicated');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function setDefault(template: TemplateRow) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!response.ok) {
        toast.error('Could not set the default');
        return;
      }
      toast.success(`“${template.name}” is now applied to new codes`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(template: TemplateRow) {
    const response = await fetch(`/api/v1/templates/${template.id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error('Could not delete the template');
      return;
    }
    toast.success('Template deleted');
    router.refresh();
  }

  const dialogOpen = creating || Boolean(editing);

  return (
    <div className="space-y-5">
      {canManage ? (
        <div className="flex justify-end">
          <Button variant="brand" onClick={openCreate}>
            <Plus /> New template
          </Button>
        </div>
      ) : null}

      {templates.length === 0 ? (
        <EmptyState
          icon={<Palette />}
          title="No templates yet"
          description="Save a design once and apply it to every new code — handy when several people create codes for the same brand."
          action={
            canManage ? (
              <Button variant="brand" onClick={openCreate}>
                Create your first template
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{template.name}</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    Updated {formatDate(template.updatedAt)}
                  </p>
                </div>
                {template.isDefault ? (
                  <Badge variant="primary">
                    <Star className="size-3" /> Default
                  </Badge>
                ) : null}
              </div>

              <div className="mb-4 flex flex-1 items-center justify-center rounded-xl bg-surface-muted/60 p-3">
                <QrPreview data={SAMPLE} design={template.design} size={150} />
              </div>

              {canManage ? (
                <div className="flex flex-wrap gap-1.5">
                  <Button size="xs" variant="outline" onClick={() => openEdit(template)}>
                    <Pencil /> Edit
                  </Button>
                  <Button size="xs" variant="outline" disabled={busy} onClick={() => void duplicate(template)}>
                    <Copy /> Duplicate
                  </Button>
                  {!template.isDefault ? (
                    <Button size="xs" variant="ghost" disabled={busy} onClick={() => void setDefault(template)}>
                      <Star /> Make default
                    </Button>
                  ) : null}
                  <Button
                    size="xs"
                    variant="ghost"
                    className="ml-auto text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleting(template)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent size="xl" className="max-h-[92dvh]">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit “${editing.name}”` : 'New template'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="min-w-0 space-y-4">
              <Field label="Template name" required help="For example: Brand primary, Menu cards, Event posters.">
                <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} autoFocus />
              </Field>

              <DesignEditor design={design} onChange={(patch) => setDesign((current) => ({ ...current, ...patch }))} brandColors={brandColors} />

              <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={makeDefault}
                  onChange={(event) => setMakeDefault(event.target.checked)}
                  className="size-4 rounded border-input"
                />
                Apply this design to new codes by default
              </label>
            </div>

            <div className="lg:sticky lg:top-0 lg:self-start">
              <div className="flex justify-center rounded-2xl bg-surface-muted/60 p-4">
                <QrPreview data={SAMPLE} design={design} size={190} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="brand" loading={busy} onClick={() => void save()}>
              <Check /> {editing ? 'Save changes' : 'Create template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this template?"
        description={deleting ? `“${deleting.name}” will no longer be available when creating codes.` : ''}
        warning="QR codes already created with this design are not affected."
        confirmLabel="Delete template"
        destructive
        onConfirm={async () => {
          if (deleting) await remove(deleting);
        }}
      />
    </div>
  );
}
