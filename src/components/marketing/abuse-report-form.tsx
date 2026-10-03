'use client';

import * as React from 'react';
import { CheckCircle2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { RadioCard, RadioGroup } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/feedback';

const REASONS = [
  { value: 'phishing', title: 'Phishing', description: 'Pretends to be a bank, service or person to steal logins or payment details.' },
  { value: 'malware', title: 'Malware', description: 'Downloads or installs something harmful.' },
  { value: 'spam', title: 'Spam', description: 'Bulk unsolicited advertising or scam content.' },
  { value: 'illegal', title: 'Illegal content', description: 'Breaks the law where it is served.' },
  { value: 'adult', title: 'Adult content without warning', description: 'Explicit material behind an innocuous code.' },
  { value: 'other', title: 'Something else', description: 'Describe it below and we will review.' },
];

export function AbuseReportForm({ defaultCode, signedIn }: { defaultCode: string; signedIn: boolean }) {
  const [shortCode, setShortCode] = React.useState(defaultCode);
  const [reason, setReason] = React.useState('phishing');
  const [details, setDetails] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/abuse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          shortCode: shortCode.trim(),
          reason,
          details: details.trim() || undefined,
          reporterEmail: email.trim() || undefined,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? 'Could not send the report. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Network problem — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Alert tone="success" title="Report received">
        <span className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          Thank you. An administrator will review the code. If you left an email address we will tell you the outcome.
        </span>
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field
        label="The code or short link"
        required
        help="Paste the full short link, or just the code at the end of it."
      >
        <Input
          value={shortCode}
          onChange={(event) => setShortCode(event.target.value)}
          placeholder="https://example.com/q/abc1234"
          required
          autoFocus={!defaultCode}
        />
      </Field>

      <Field label="What is wrong with it?" required>
        <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
          {REASONS.map((item) => (
            <RadioCard
              key={item.value}
              value={item.value}
              title={item.title}
              description={item.description}
              id={`reason-${item.value}`}
            />
          ))}
        </RadioGroup>
      </Field>

      <Field label="Anything else we should know?" hint="optional">
        <Textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="What happened when you scanned it? Where did it lead?"
          rows={4}
          maxLength={2000}
        />
      </Field>

      {!signedIn ? (
        <Field label="Your email" hint="optional" help="Only used to tell you the outcome.">
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </Field>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading} disabled={!shortCode.trim()}>
        <Flag /> Send report
      </Button>
    </form>
  );
}
