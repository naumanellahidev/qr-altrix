'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthForm } from '@/components/auth/auth-form';
import { QrThumb } from '@/components/qr/qr-preview';
import type { QrDesign } from '@/lib/qr/types';
import { useGeneratorCopy } from '@/components/qr/generator-copy';

export interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'signup' | 'login';
  googleEnabled?: boolean;
  next?: string;
  /** Preview of the code being saved, shown so the visitor sees nothing was lost. */
  preview?: { data: string; design: Partial<QrDesign>; label?: string } | null;
  onSuccess?: (result: { userId: string; claimedDraft: boolean; qrCodeId?: string | null }) => void;
  title?: string;
  description?: string;
}

/**
 * The account gate used at the moment of download. Copy is deliberately short — the
 * visitor has already done the work and just needs somewhere to keep it.
 */
export function AuthDialog({
  open,
  onOpenChange,
  mode = 'signup',
  googleEnabled = true,
  next = '/dashboard?claim=1',
  preview,
  onSuccess,
  title,
  description,
}: AuthDialogProps) {
  const { copy } = useGeneratorCopy();
  const a = copy.auth;
  const [currentMode, setCurrentMode] = React.useState<'signup' | 'login'>(mode);

  React.useEffect(() => {
    if (open) setCurrentMode(mode);
  }, [open, mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" className="gap-4">
        <DialogHeader>
          <DialogTitle className="text-[20px]">
            {currentMode === 'signup' ? (title ?? a.title) : a.welcomeBack}
          </DialogTitle>
          <DialogDescription>
            {currentMode === 'signup' ? (description ?? copy.signupDescription) : a.loginDescription}
          </DialogDescription>
        </DialogHeader>

        {preview ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 p-3">
            <QrThumb data={preview.data} design={preview.design} size={52} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{preview.label || a.ready}</p>
              <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                {a.saved}
              </p>
            </div>
          </div>
        ) : null}

        <AuthForm
          mode={currentMode}
          next={next}
          googleEnabled={googleEnabled}
          onSwitchMode={setCurrentMode}
          onSuccess={onSuccess}
          compact
        />
      </DialogContent>
    </Dialog>
  );
}
