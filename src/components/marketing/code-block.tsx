'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Read-only code sample with a copy button. Deliberately unhighlighted: the examples are
 * short, and a syntax highlighter would add weight for no comprehension gain.
 */
export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={cn('relative', className)}>
      {language ? (
        <span className="absolute left-3 top-2.5 rounded-md bg-background/70 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">
          {language}
        </span>
      ) : null}
      <pre className="overflow-x-auto rounded-xl border border-border bg-surface-muted/60 p-4 pt-8 font-mono text-[12px] leading-6">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Copy code"
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
