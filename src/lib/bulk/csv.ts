import Papa from 'papaparse';
import { getTypeDef, type FieldDef } from '../qr/catalog';
import { isValidHttpUrl } from '../utils';

/** CSV helpers for bulk generation: template, parsing, column mapping and validation. */

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export function parseCsv(text: string, maxRows = 50_000): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  const errors = (result.errors ?? [])
    .slice(0, 10)
    .map((e) => `Row ${typeof e.row === 'number' ? e.row + 2 : '?'}: ${e.message}`);

  const rows = (result.data ?? [])
    .slice(0, maxRows)
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.trim(), typeof value === 'string' ? value.trim() : '']),
      ),
    )
    .filter((row) => Object.values(row).some((v) => v !== ''));

  return {
    headers: (result.meta?.fields ?? []).map((f) => f.trim()).filter(Boolean),
    rows,
    errors,
  };
}

/** Fields that make sense as CSV columns (files and repeaters are skipped). */
export function importableFields(type: string): FieldDef[] {
  const def = getTypeDef(type);
  if (!def) return [];
  return def.fields.filter((f) => !['file', 'files', 'repeater', 'color'].includes(f.type));
}

export function csvTemplateFor(type: string): string {
  const fields = importableFields(type);
  const headers = ['name', ...fields.map((f) => f.name), 'slug', 'folder'];
  const sampleByField: Record<string, string> = {
    url: 'https://example.com/page-1',
    text: 'Hello from QR ALTRIX',
    ssid: 'Cafe-Guest',
    password: 'welcome123',
    firstName: 'Ayesha',
    lastName: 'Khan',
    email: 'ayesha@example.com',
    phone: '+923000000000',
    title: 'Spring campaign',
    headline: '20% off this week',
    message: 'Hi! I scanned your code',
    gtin: '09506000134352',
  };
  const sample = headers.map((header) => {
    if (header === 'name') return 'Campaign code 1';
    if (header === 'slug') return 'spring-1';
    if (header === 'folder') return 'Campaigns';
    return sampleByField[header] ?? '';
  });
  return `${headers.join(',')}\n${sample.join(',')}\n`;
}

export interface RowValidationIssue {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface MappingValidation {
  ok: boolean;
  issues: RowValidationIssue[];
  missingRequired: string[];
  preview: { name: string; content: Record<string, string> }[];
}

/**
 * Validates the mapping and every row before anything is written, so the user can fix
 * a spreadsheet instead of cleaning up half-imported codes.
 */
export function validateMapping(options: {
  type: string;
  mapping: Record<string, string>;
  rows: Record<string, string>[];
  maxIssues?: number;
}): MappingValidation {
  const def = getTypeDef(options.type);
  const issues: RowValidationIssue[] = [];
  const maxIssues = options.maxIssues ?? 200;

  if (!def) {
    return { ok: false, issues: [{ row: 0, field: 'type', message: 'Unknown QR code type' }], missingRequired: [], preview: [] };
  }

  const fields = importableFields(options.type);
  const missingRequired = fields
    .filter((f) => f.required && !options.mapping[f.name])
    .map((f) => f.label);

  if (!options.mapping.name) missingRequired.push('QR code name');

  options.rows.forEach((row, index) => {
    if (issues.length >= maxIssues) return;
    const rowNumber = index + 2; // +2 accounts for the header row and 1-based counting

    const nameColumn = options.mapping.name;
    if (nameColumn && !row[nameColumn]) {
      issues.push({ row: rowNumber, field: 'name', message: 'Name is empty' });
    }

    for (const field of fields) {
      const column = options.mapping[field.name];
      if (!column) continue;
      const value = row[column] ?? '';
      if (!value) {
        if (field.required) {
          issues.push({ row: rowNumber, field: field.name, message: `${field.label} is empty` });
        }
        continue;
      }
      if (field.type === 'url') {
        const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
        if (!isValidHttpUrl(normalized)) {
          issues.push({ row: rowNumber, field: field.name, message: `${field.label} is not a valid URL`, value });
        }
      }
      if (field.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        issues.push({ row: rowNumber, field: field.name, message: `${field.label} is not a valid email`, value });
      }
      if (field.type === 'number' && !Number.isFinite(Number(value))) {
        issues.push({ row: rowNumber, field: field.name, message: `${field.label} must be a number`, value });
      }
    }

    const slugColumn = options.mapping.slug;
    if (slugColumn && row[slugColumn] && !/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,63}$/.test(row[slugColumn])) {
      issues.push({ row: rowNumber, field: 'slug', message: 'Short link may only contain letters, numbers, - and _', value: row[slugColumn] });
    }
  });

  const duplicateSlugs = new Map<string, number>();
  if (options.mapping.slug) {
    options.rows.forEach((row, index) => {
      const slug = row[options.mapping.slug];
      if (!slug) return;
      const seen = duplicateSlugs.get(slug);
      if (seen !== undefined) {
        issues.push({ row: index + 2, field: 'slug', message: `Duplicate short link, first used on row ${seen}`, value: slug });
      } else {
        duplicateSlugs.set(slug, index + 2);
      }
    });
  }

  const preview = options.rows.slice(0, 5).map((row) => ({
    name: options.mapping.name ? (row[options.mapping.name] ?? '') : '',
    content: Object.fromEntries(
      fields
        .filter((f) => options.mapping[f.name])
        .map((f) => [f.name, row[options.mapping[f.name]] ?? '']),
    ),
  }));

  return { ok: issues.length === 0 && missingRequired.length === 0, issues, missingRequired, preview };
}

/** Turns one CSV row into the content object for createQrCode. */
export function rowToContent(type: string, mapping: Record<string, string>, row: Record<string, string>) {
  const fields = importableFields(type);
  const content: Record<string, unknown> = {};
  for (const field of fields) {
    const column = mapping[field.name];
    if (!column) continue;
    const value = row[column];
    if (value === undefined || value === '') continue;
    if (field.type === 'switch') {
      content[field.name] = ['1', 'true', 'yes', 'y', 'on'].includes(value.toLowerCase());
    } else if (field.type === 'number') {
      content[field.name] = Number(value);
    } else {
      content[field.name] = value;
    }
  }
  return content;
}

export function guessMapping(type: string, headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalized = headers.map((h) => ({ raw: h, key: h.toLowerCase().replace(/[^a-z0-9]/g, '') }));

  const match = (...candidates: string[]) => {
    for (const candidate of candidates) {
      const needle = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = normalized.find((h) => h.key === needle);
      if (found) return found.raw;
    }
    for (const candidate of candidates) {
      const needle = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = normalized.find((h) => h.key.includes(needle));
      if (found) return found.raw;
    }
    return undefined;
  };

  const name = match('name', 'title', 'label', 'qrname');
  if (name) mapping.name = name;
  const slug = match('slug', 'shortlink', 'short', 'code');
  if (slug) mapping.slug = slug;
  const folder = match('folder', 'group', 'category');
  if (folder) mapping.folder = folder;

  for (const field of importableFields(type)) {
    const found = match(field.name, field.label);
    if (found) mapping[field.name] = found;
  }
  return mapping;
}
