'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/feedback';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra explanation of what cannot be undone. */
  warning?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** When set, the user must type this exact text before confirming. */
  requireText?: string;
  /** Extra fields rendered inside the dialog, e.g. a password confirmation. */
  extra?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
}

/** Shared confirmation dialog so destructive actions always look and behave the same. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  warning,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  requireText,
  extra,
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [typed, setTyped] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setTyped('');
      setLoading(false);
    }
  }, [open]);

  const canConfirm = !requireText || typed.trim() === requireText;

  async function handleConfirm() {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {warning ? <Alert tone={destructive ? 'error' : 'warning'}>{warning}</Alert> : null}

        {extra}

        {requireText ? (
          <div className="space-y-1.5">
            <label htmlFor="confirm-text" className="text-[13px] font-medium">
              Type <span className="font-mono text-destructive">{requireText}</span> to continue
            </label>
            <Input
              id="confirm-text"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              placeholder={requireText}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            loading={loading}
            disabled={!canConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Hook form of the dialog for list rows that each need their own confirmation. */
export function useConfirm() {
  const [state, setState] = React.useState<(Omit<ConfirmDialogProps, 'open' | 'onOpenChange'> & { id: number }) | null>(
    null,
  );

  const confirm = React.useCallback((options: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    setState({ ...options, id: Date.now() });
  }, []);

  const element = state ? (
    <ConfirmDialog
      key={state.id}
      {...state}
      open
      onOpenChange={(open) => {
        if (!open) setState(null);
      }}
    />
  ) : null;

  return { confirm, element };
}
