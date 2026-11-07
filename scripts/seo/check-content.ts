// Checks the English search content: every [words](/path) link resolves, slugs are unique,
// titles/descriptions are within search-result lengths. Run: npx tsx scripts/seo/check-content.ts
import { allSeoDocs, seoPath, SEO_KINDS } from '../../src/content/seo';
import { GUIDES, TYPE_SLUGS, USE_CASES } from '../../src/content/registry';

const valid = new Set<string>(['/', '/#generator', '/best-free-qr-code-generator', '/report-abuse', '/tools/qr-code-scanner', '/tools/bulk-qr-code-generator', '/qr-code-generator', '/use-cases', '/guides', '/support']);
Object.values(SEO_KINDS).forEach((k) => valid.add(k.path));
Object.values(TYPE_SLUGS).forEach((s) => valid.add(`/qr-code-generator/${s}`));
USE_CASES.forEach((u) => valid.add(`/use-cases/${u.slug}`));
GUIDES.forEach((g) => valid.add(`/guides/${g.slug}`));
const docs = allSeoDocs();
const seen = new Set<string>();
let errors = 0;
const err = (m: string) => { errors++; console.log('ERR', m); };
for (const d of docs) {
  const p = seoPath(d.kind, d.slug);
  if (seen.has(p) || (d.kind === 'guides' && GUIDES.some((g) => g.slug === d.slug))) err(`duplicate ${p}`);
  seen.add(p); valid.add(p);
}
let words = 0;
for (const d of docs) {
  const p = seoPath(d.kind, d.slug);
  const text = JSON.stringify(d);
  words += text.split(/\s+/).length;
  for (const m of text.matchAll(/\]\((\/[^)\s]*)\)/g)) if (!valid.has(m[1])) err(`${p} -> ${m[1]}`);
  if (d.title.length > 62) err(`${p} title ${d.title.length}`);
  if (d.description.length < 100 || d.description.length > 165) err(`${p} description ${d.description.length}`);
  if (d.answer.split(/\s+/).length > 85) err(`${p} answer ${d.answer.split(/\s+/).length} words`);
}
const inbound = new Map<string, number>();
for (const d of docs) for (const m of JSON.stringify(d).matchAll(/\]\((\/[^)\s]*)\)/g)) inbound.set(m[1], (inbound.get(m[1]) ?? 0) + 1);
console.log(`docs ${docs.length} (${['answers', 'guides', 'for'].map((k) => docs.filter((d) => d.kind === k).length).join('/')}), ~${words} words, errors ${errors}`);
console.log('no in-text inbound links:', docs.filter((d) => !inbound.get(seoPath(d.kind, d.slug))).map((d) => seoPath(d.kind, d.slug)).join(' '));
process.exit(errors ? 1 : 0);
