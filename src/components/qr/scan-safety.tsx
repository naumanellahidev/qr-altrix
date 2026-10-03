'use client';

import * as React from 'react';
import { CheckCircle2, Info, ShieldCheck, TriangleAlert, XCircle } from 'lucide-react';
import { checkScanSafety, type ScanSafetyReport } from '@/lib/qr/contrast';
import type { QrDesign } from '@/lib/qr/types';
import { cn } from '@/lib/utils';

const LEVEL_META = {
  excellent: { label: 'Excellent', tone: 'text-success', ring: 'stroke-success', icon: ShieldCheck },
  good: { label: 'Good', tone: 'text-success', ring: 'stroke-success', icon: CheckCircle2 },
  risky: { label: 'Risky', tone: 'text-warning', ring: 'stroke-warning', icon: TriangleAlert },
  fail: { label: 'Will likely fail', tone: 'text-destructive', ring: 'stroke-destructive', icon: XCircle },
} as const;

export function ScanSafety({
  design,
  moduleCount,
  className,
  compact,
}: {
  design: Partial<QrDesign>;
  moduleCount?: number;
  className?: string;
  compact?: boolean;
}) {
  const report: ScanSafetyReport = React.useMemo(
    () => checkScanSafety(design, moduleCount ?? 33),
    [design, moduleCount],
  );

  const meta = LEVEL_META[report.level];
  const Icon = meta.icon;
  const circumference = 2 * Math.PI * 16;

  return (
    <div className={cn('rounded-xl border border-border bg-surface p-3.5', className)}>
      <div className="flex items-center gap-3">
        <div className="relative size-10 shrink-0">
          <svg viewBox="0 0 40 40" className="size-10 -rotate-90">
            <circle cx="20" cy="20" r="16" className="fill-none stroke-border" strokeWidth="3.5" />
            <circle
              cx="20"
              cy="20"
              r="16"
              className={cn('fill-none transition-[stroke-dashoffset] duration-500', meta.ring)}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - report.score / 100)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">
            {report.score}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13.5px] font-semibold">
            <Icon className={cn('size-4', meta.tone)} />
            Scan safety: <span className={meta.tone}>{meta.label}</span>
          </p>
          <p className="text-[12px] leading-5 text-muted-foreground">
            Contrast {report.contrastRatio}:1
            {moduleCount ? ` · ${moduleCount}×${moduleCount} modules` : ''}
            {report.issues.length === 0 ? ' · no problems found' : ''}
          </p>
        </div>
      </div>

      {report.issues.length > 0 && !compact ? (
        <ul className="mt-3 space-y-2 border-t border-border pt-3">
          {report.issues.map((issue, index) => (
            <li key={index} className="flex gap-2 text-[12.5px] leading-5">
              {issue.severity === 'error' ? (
                <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              ) : issue.severity === 'warning' ? (
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
              ) : (
                <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0">
                <span className="font-medium">{issue.title}</span>
                <span className="block text-muted-foreground">{issue.fix}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
