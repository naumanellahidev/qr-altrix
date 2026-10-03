'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, Download, FileSpreadsheet, FileUp, Layers, Play,
  RefreshCw, Table2,
} from 'lucide-react';
import { parseCsv } from '@/lib/bulk/csv';
import { QR_TYPES, getTypeDef } from '@/lib/qr/catalog';
import { cn, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { Progress } from '@/components/ui/misc';
import { SectionHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { useDateFormat, DATE, DATE_TIME, TIME } from '@/lib/hooks/use-date-format';

interface ValidationField {
  name: string;
  label: string;
  required: boolean;
  type: string;
}

interface RowIssue {
  row: number;
  field: string;
  message: string;
  value?: string;
}

interface ValidationResult {
  mapping: Record<string, string>;
  fields: ValidationField[];
  ok: boolean;
  issues: RowIssue[];
  missingRequired: string[];
  preview: { name: string; content: Record<string, string> }[];
  rowCount: number;
  overLimit: boolean;
  maxRows: number;
}

export interface BulkJobRow {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  type: string;
  kind: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  createdCount: number;
  hasArchive: boolean;
  note: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export function BulkWizard({
  folders,
  templates,
  domains,
  jobs,
  maxRows,
}: {
  folders: { id: string; name: string }[];
  templates: { id: string; name: string }[];
  domains: { id: string; host: string; status: string }[];
  jobs: BulkJobRow[];
  maxRows: number;
}) {
  const formatDate = useDateFormat();
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [step, setStep] = React.useState(1);
  const [type, setType] = React.useState('WEBSITE');
  const [rows, setRows] = React.useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [fileName, setFileName] = React.useState('');
  const [validation, setValidation] = React.useState<ValidationResult | null>(null);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [folderId, setFolderId] = React.useState('none');
  const [templateId, setTemplateId] = React.useState('none');
  const [domainId, setDomainId] = React.useState('none');
  const [busy, setBusy] = React.useState(false);
  const [activeJob, setActiveJob] = React.useState<BulkJobRow | null>(null);

  const def = getTypeDef(type);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('That file is larger than 25 MB. Split it into smaller batches.');
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text, maxRows + 1);

    if (parsed.rows.length === 0) {
      toast.error('No usable rows found. Check the file has a header row.');
      return;
    }
    setFileName(file.name);
    setRows(parsed.rows);
    setHeaders(parsed.headers);
    if (parsed.errors.length > 0) {
      toast.warning(`${parsed.errors.length} parsing note(s) — review the rows below.`);
    }
    await validate(parsed.rows, parsed.headers, undefined);
    setStep(3);
  }

  async function validate(
    currentRows: Record<string, string>[],
    currentHeaders: string[],
    currentMapping: Record<string, string> | undefined,
  ) {
    setBusy(true);
    try {
      const response = await fetch('/api/v1/bulk/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, headers: currentHeaders, mapping: currentMapping, rows: currentRows }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: ValidationResult; error?: string };
      if (!response.ok || !payload.ok || !payload.data) {
        toast.error(payload.error ?? 'Could not validate that file');
        return;
      }
      setValidation(payload.data);
      setMapping(currentMapping ?? payload.data.mapping);
    } finally {
      setBusy(false);
    }
  }

  async function startImport() {
    setBusy(true);
    try {
      const response = await fetch('/api/v1/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: def?.kind ?? 'DYNAMIC',
          type,
          mapping,
          rows,
          folderId: folderId === 'none' ? null : folderId,
          templateId: templateId === 'none' ? null : templateId,
          customDomainId: domainId === 'none' ? null : domainId,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        data?: { id: string };
      };
      if (!response.ok || !payload.ok || !payload.data) {
        toast.error(payload.error ?? 'Could not start the import');
        return;
      }
      setStep(5);
      await pollJob(payload.data.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function pollJob(jobId: string) {
    for (let attempt = 0; attempt < 600; attempt += 1) {
      const response = await fetch(`/api/v1/bulk/${jobId}`);
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: BulkJobRow & { progress: number } };
      if (payload.data) {
        setActiveJob(payload.data);
        if (['COMPLETED', 'PARTIAL', 'FAILED'].includes(payload.data.status)) {
          if (payload.data.status === 'COMPLETED') toast.success(`${payload.data.successRows} QR codes created`);
          else if (payload.data.status === 'PARTIAL') toast.warning('Finished with some failed rows');
          else toast.error('The import failed');
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  const importableFields = validation?.fields ?? [];

  return (
    <div className="space-y-5">
      <Alert tone="success" title="No row limit beyond what your server can take">
        This install accepts up to {formatNumber(maxRows)} rows per import — an anti-abuse guard, not a plan limit.
        Codes created here never expire.
      </Alert>

      {/* ------------------------------------------------------------ stepper */}
      <ol className="flex flex-wrap items-center gap-1.5">
        {['Choose type', 'Upload CSV', 'Map columns', 'Options', 'Run'].map((label, index) => {
          const number = index + 1;
          return (
            <li key={label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium',
                  step === number
                    ? 'bg-primary text-primary-foreground'
                    : step > number
                      ? 'bg-primary-soft text-primary'
                      : 'text-muted-foreground',
                )}
              >
                <span className="flex size-5 items-center justify-center rounded-md bg-black/10 text-[11px] font-bold">
                  {step > number ? <Check className="size-3" /> : number}
                </span>
                {label}
              </span>
              {number < 5 ? <span className="h-px w-3 bg-border" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>

      {/* --------------------------------------------------------------- step 1 */}
      {step === 1 ? (
        <Card className="p-5">
          <SectionHeader
            title="What kind of codes are you importing?"
            description="One type per import. Run the wizard again for a different type."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="QR code type" help={def?.description}>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value);
                  setValidation(null);
                  setRows([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QR_TYPES.map((item) => (
                    <SelectItem key={item.type} value={item.type}>
                      {item.label} ({item.kind === 'DYNAMIC' ? 'dynamic' : 'static'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-end">
              <Button asChild variant="outline">
                <a href={`/api/v1/bulk/template?type=${type}`}>
                  <Download /> Download CSV template
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button variant="brand" onClick={() => setStep(2)}>
              Continue <ArrowRight />
            </Button>
          </div>
        </Card>
      ) : null}

      {/* --------------------------------------------------------------- step 2 */}
      {step === 2 ? (
        <Card className="p-5">
          <SectionHeader title="Upload your CSV" description="The first row must be a header row." />
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void handleFile(event.dataTransfer.files?.[0]);
            }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted/50 px-6 py-12 text-center"
          >
            <FileUp className="size-7 text-muted-foreground" />
            <p className="text-[14px] font-medium">Drop your CSV here</p>
            <p className="max-w-sm text-[12.5px] leading-5 text-muted-foreground">
              Up to {formatNumber(maxRows)} rows and 25 MB. Nothing is written until every row passes validation.
            </p>
            <Button variant="brand" loading={busy} onClick={() => fileRef.current?.click()}>
              <FileSpreadsheet /> Choose a file
            </Button>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft /> Back
            </Button>
          </div>
        </Card>
      ) : null}

      {/* --------------------------------------------------------------- step 3 */}
      {step === 3 && validation ? (
        <div className="space-y-4">
          <Card className="p-5">
            <SectionHeader
              title="Map your columns"
              description={`${fileName} · ${formatNumber(validation.rowCount)} rows detected`}
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  loading={busy}
                  onClick={() => void validate(rows, headers, mapping)}
                >
                  <RefreshCw /> Re-check
                </Button>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="QR code name" required help="Each code needs a name you will recognise.">
                <Select
                  value={mapping.name ?? 'none'}
                  onValueChange={(value) =>
                    setMapping((current) => ({ ...current, name: value === 'none' ? '' : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not mapped</SelectItem>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {importableFields.map((field) => (
                <Field key={field.name} label={field.label} required={field.required}>
                  <Select
                    value={mapping[field.name] ?? 'none'}
                    onValueChange={(value) =>
                      setMapping((current) => ({ ...current, [field.name]: value === 'none' ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not mapped</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ))}

              {def?.kind === 'DYNAMIC' ? (
                <Field label="Custom short link" hint="optional">
                  <Select
                    value={mapping.slug ?? 'none'}
                    onValueChange={(value) =>
                      setMapping((current) => ({ ...current, slug: value === 'none' ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not mapped" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not mapped</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}

              <Field label="Folder name" hint="optional" help="Folders are created automatically when a name is new.">
                <Select
                  value={mapping.folder ?? 'none'}
                  onValueChange={(value) =>
                    setMapping((current) => ({ ...current, folder: value === 'none' ? '' : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Not mapped" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not mapped</SelectItem>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Card>

          {validation.overLimit ? (
            <Alert tone="error" title="Too many rows">
              This file has {formatNumber(validation.rowCount)} rows and the server accepts{' '}
              {formatNumber(validation.maxRows)}. Split it and run the import again.
            </Alert>
          ) : null}

          {validation.missingRequired.length > 0 ? (
            <Alert tone="warning" title="Map these before continuing">
              {validation.missingRequired.join(', ')}
            </Alert>
          ) : null}

          {validation.issues.length > 0 ? (
            <Card className="p-5">
              <SectionHeader
                title={`${validation.issues.length} row problem${validation.issues.length === 1 ? '' : 's'}`}
                description="Fix these in your spreadsheet and upload again. Nothing is imported while problems remain."
              />
              <div className="max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Row</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead className="hidden sm:table-cell">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validation.issues.slice(0, 200).map((issue, index) => (
                      <TableRow key={index}>
                        <TableCell className="tabular-nums">{issue.row}</TableCell>
                        <TableCell className="font-mono text-[12px]">{issue.field}</TableCell>
                        <TableCell className="text-[12.5px]">{issue.message}</TableCell>
                        <TableCell className="hidden max-w-[16rem] truncate font-mono text-[12px] text-muted-foreground sm:table-cell">
                          {issue.value ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <Alert tone="success" title="Every row passed validation">
              {formatNumber(validation.rowCount)} rows are ready to import.
            </Alert>
          )}

          {validation.preview.length > 0 ? (
            <Card className="p-5">
              <SectionHeader title="Preview" description="The first few rows, as they will be created." />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {Object.keys(validation.preview[0].content).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validation.preview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-[13px] font-medium">{row.name || '—'}</TableCell>
                      {Object.values(row.content).map((value, valueIndex) => (
                        <TableCell key={valueIndex} className="max-w-[16rem] truncate text-[12.5px] text-muted-foreground">
                          {value || '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : null}

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ArrowLeft /> Choose another file
            </Button>
            <Button
              variant="brand"
              disabled={!validation.ok || validation.overLimit}
              onClick={() => setStep(4)}
            >
              Continue <ArrowRight />
            </Button>
          </div>
        </div>
      ) : null}

      {/* --------------------------------------------------------------- step 4 */}
      {step === 4 ? (
        <Card className="p-5">
          <SectionHeader title="Import options" description="Applied to every code in this batch." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Folder" help="Overridden by a mapped folder column.">
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue />
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

            <Field label="Design template">
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default design</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {def?.kind === 'DYNAMIC' ? (
              <Field label="Short domain">
                <Select value={domainId} onValueChange={setDomainId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Platform default</SelectItem>
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
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}>
              <ArrowLeft /> Back
            </Button>
            <Button variant="brand" loading={busy} onClick={() => void startImport()}>
              <Play /> Create {formatNumber(rows.length)} QR codes
            </Button>
          </div>
        </Card>
      ) : null}

      {/* --------------------------------------------------------------- step 5 */}
      {step === 5 ? (
        <Card className="p-5">
          <SectionHeader
            title={
              activeJob?.status === 'COMPLETED'
                ? 'Import finished'
                : activeJob?.status === 'PARTIAL'
                  ? 'Import finished with some failures'
                  : activeJob?.status === 'FAILED'
                    ? 'Import failed'
                    : 'Importing…'
            }
            description={
              activeJob
                ? `${formatNumber(activeJob.processedRows)} of ${formatNumber(activeJob.totalRows)} rows processed`
                : 'Starting the job…'
            }
          />

          <Progress
            value={activeJob && activeJob.totalRows > 0 ? (activeJob.processedRows / activeJob.totalRows) * 100 : 5}
            className="mb-4"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-[20px] font-semibold tabular-nums">{activeJob?.successRows ?? 0}</p>
              <p className="text-[11.5px] text-muted-foreground">created</p>
            </div>
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-[20px] font-semibold tabular-nums">{activeJob?.failedRows ?? 0}</p>
              <p className="text-[11.5px] text-muted-foreground">failed rows</p>
            </div>
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-[20px] font-semibold tabular-nums">{activeJob?.totalRows ?? rows.length}</p>
              <p className="text-[11.5px] text-muted-foreground">total rows</p>
            </div>
          </div>

          {activeJob?.note ? (
            <Alert tone="info" className="mt-4">
              {activeJob.note}
            </Alert>
          ) : null}

          {activeJob && ['COMPLETED', 'PARTIAL', 'FAILED'].includes(activeJob.status) ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {activeJob.hasArchive ? (
                <Button asChild variant="brand">
                  <a href={`/api/v1/bulk/${activeJob.id}?download=zip`}>
                    <Download /> Download all as ZIP
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/dashboard/codes">
                  <Table2 /> Open My QR codes
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setRows([]);
                  setValidation(null);
                  setActiveJob(null);
                }}
              >
                Import another file
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* --------------------------------------------------------- past jobs */}
      <Card className="p-5">
        <SectionHeader title="Recent imports" />
        {jobs.length === 0 ? (
          <EmptyState icon={<Layers />} title="No imports yet" description="Your import history will appear here." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="whitespace-nowrap text-[12.5px] text-muted-foreground">
                    {formatDate(job.createdAt, DATE_TIME)}
                  </TableCell>
                  <TableCell className="text-[13px]">{getTypeDef(job.type)?.label ?? job.type}</TableCell>
                  <TableCell className="text-[13px] tabular-nums">
                    {job.successRows} created
                    {job.failedRows > 0 ? (
                      <span className="text-destructive"> · {job.failedRows} failed</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {job.status === 'COMPLETED' ? (
                      <Badge variant="success">Completed</Badge>
                    ) : job.status === 'PARTIAL' ? (
                      <Badge variant="warning">
                        <AlertTriangle className="size-3" /> Partial
                      </Badge>
                    ) : job.status === 'FAILED' ? (
                      <Badge variant="destructive">Failed</Badge>
                    ) : (
                      <Badge variant="outline">{job.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.hasArchive ? (
                      <Button asChild variant="ghost" size="icon-sm" aria-label="Download archive">
                        <a href={`/api/v1/bulk/${job.id}?download=zip`}>
                          <Download />
                        </a>
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
