import { describe, expect, it } from 'vitest';
import { csvTemplateFor, guessMapping, importableFields, parseCsv, rowToContent, validateMapping } from '@/lib/bulk/csv';

const CSV = `name,Website URL,Short link,Folder
Spring poster,https://example.com/spring,spring,Campaigns
Summer poster,https://example.com/summer,summer,Campaigns
`;

describe('parseCsv', () => {
  it('reads the header row and trims values', () => {
    const parsed = parseCsv('name , url \nA , https://a.test \n');
    expect(parsed.headers).toEqual(['name', 'url']);
    expect(parsed.rows[0]).toEqual({ name: 'A', url: 'https://a.test' });
  });

  it('drops completely empty rows', () => {
    const parsed = parseCsv('name,url\nA,https://a.test\n,\n\n');
    expect(parsed.rows).toHaveLength(1);
  });

  it('respects the row cap', () => {
    const many = ['name,url', ...Array.from({ length: 50 }, (_, index) => `n${index},https://a.test`)].join('\n');
    expect(parseCsv(many, 10).rows).toHaveLength(10);
  });
});

describe('guessMapping', () => {
  it('matches columns by label as well as field name', () => {
    const parsed = parseCsv(CSV);
    const mapping = guessMapping('WEBSITE', parsed.headers);
    expect(mapping.name).toBe('name');
    expect(mapping.url).toBe('Website URL');
    expect(mapping.slug).toBe('Short link');
    expect(mapping.folder).toBe('Folder');
  });

  it('leaves unmatched fields out rather than guessing wildly', () => {
    const mapping = guessMapping('WIFI', ['something', 'else']);
    expect(mapping.ssid).toBeUndefined();
  });
});

describe('importableFields', () => {
  it('excludes uploads, repeaters and colour pickers', () => {
    const fields = importableFields('VCARD_PLUS').map((field) => field.name);
    expect(fields).toContain('firstName');
    expect(fields).not.toContain('photo'); // file
    expect(fields).not.toContain('socials'); // repeater
    expect(fields).not.toContain('coverColor'); // colour
  });
});

describe('validateMapping', () => {
  const parsed = parseCsv(CSV);

  it('passes a clean file', () => {
    const result = validateMapping({
      type: 'WEBSITE',
      mapping: guessMapping('WEBSITE', parsed.headers),
      rows: parsed.rows,
    });
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.preview).toHaveLength(2);
  });

  it('reports required fields that are not mapped', () => {
    const result = validateMapping({ type: 'WEBSITE', mapping: { name: 'name' }, rows: parsed.rows });
    expect(result.ok).toBe(false);
    expect(result.missingRequired.length).toBeGreaterThan(0);
  });

  it('reports a missing name column', () => {
    const result = validateMapping({ type: 'WEBSITE', mapping: { url: 'Website URL' }, rows: parsed.rows });
    expect(result.missingRequired).toContain('QR code name');
  });

  it('reports an invalid URL with its row number', () => {
    const rows = [{ name: 'Bad', url: 'not a url at all' }];
    const result = validateMapping({ type: 'WEBSITE', mapping: { name: 'name', url: 'url' }, rows });
    expect(result.ok).toBe(false);
    expect(result.issues[0]).toMatchObject({ row: 2, field: 'url' });
  });

  it('accepts a bare domain because it is normalised to https', () => {
    const rows = [{ name: 'Ok', url: 'example.com/page' }];
    const result = validateMapping({ type: 'WEBSITE', mapping: { name: 'name', url: 'url' }, rows });
    expect(result.ok).toBe(true);
  });

  it('reports an empty required cell', () => {
    const rows = [{ name: 'Missing url', url: '' }];
    const result = validateMapping({ type: 'WEBSITE', mapping: { name: 'name', url: 'url' }, rows });
    expect(result.issues.some((issue) => issue.field === 'url' && issue.message.includes('empty'))).toBe(true);
  });

  it('reports an empty name cell', () => {
    const rows = [{ name: '', url: 'https://a.test' }];
    const result = validateMapping({ type: 'WEBSITE', mapping: { name: 'name', url: 'url' }, rows });
    expect(result.issues.some((issue) => issue.field === 'name')).toBe(true);
  });

  it('reports a duplicate short link and names the first row that used it', () => {
    const rows = [
      { name: 'A', url: 'https://a.test', slug: 'same' },
      { name: 'B', url: 'https://b.test', slug: 'same' },
    ];
    const result = validateMapping({
      type: 'WEBSITE',
      mapping: { name: 'name', url: 'url', slug: 'slug' },
      rows,
    });
    const duplicate = result.issues.find((issue) => issue.field === 'slug');
    expect(duplicate?.row).toBe(3);
    expect(duplicate?.message).toContain('row 2');
  });

  it('rejects a slug with illegal characters', () => {
    const rows = [{ name: 'A', url: 'https://a.test', slug: 'has spaces/and-slash' }];
    const result = validateMapping({
      type: 'WEBSITE',
      mapping: { name: 'name', url: 'url', slug: 'slug' },
      rows,
    });
    expect(result.issues.some((issue) => issue.field === 'slug')).toBe(true);
  });

  it('rejects an invalid email for a contact import', () => {
    const rows = [{ name: 'A', firstName: 'Ayesha', email: 'not-an-email' }];
    const result = validateMapping({
      type: 'VCARD',
      mapping: { name: 'name', firstName: 'firstName', email: 'email' },
      rows,
    });
    expect(result.issues.some((issue) => issue.field === 'email')).toBe(true);
  });

  it('reports an unknown type rather than throwing', () => {
    const result = validateMapping({ type: 'NOT_A_TYPE', mapping: {}, rows: [] });
    expect(result.ok).toBe(false);
    expect(result.issues[0].field).toBe('type');
  });
});

describe('rowToContent', () => {
  it('maps and coerces values', () => {
    const content = rowToContent(
      'WIFI',
      { ssid: 'net', password: 'pw', hidden: 'hidden' },
      { net: 'Cafe', pw: 'secret', hidden: 'yes' },
    );
    expect(content).toEqual({ ssid: 'Cafe', password: 'secret', hidden: true });
  });

  it('skips empty cells so defaults can apply', () => {
    const content = rowToContent('WEBSITE', { url: 'url' }, { url: '' });
    expect(content).toEqual({});
  });
});

describe('csvTemplateFor', () => {
  it('includes the name, the type fields and the extras', () => {
    const template = csvTemplateFor('WEBSITE');
    const [header, sample] = template.trim().split('\n');
    expect(header.split(',')).toContain('name');
    expect(header.split(',')).toContain('url');
    expect(header.split(',')).toContain('slug');
    expect(header.split(',')).toContain('folder');
    expect(sample).toContain('https://example.com/page-1');
  });

  it('adapts to the chosen type', () => {
    expect(csvTemplateFor('WIFI').split('\n')[0]).toContain('ssid');
  });
});
