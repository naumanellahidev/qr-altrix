// End-to-end QR check against a running install: sign up → create every type → download
// the real PNG → decode it with ZXing → follow it like a phone → check the page, the
// hosted extras, the file byte ranges and password reset; then delete the test account.
//
// Run inside the app container (it needs the app's node_modules: sharp, zxing-wasm):
//   docker cp scripts/e2e-live-check.mjs qraltrix-app-1:/app/e2e.mjs
//   docker compose -p qraltrix -f docker-compose.vps.yml exec -T //     -e PUBLIC_BASE=https://qraltrix.co.uk -e E2E_EMAIL=<inbox you can read> app node /app/e2e.mjs
// With "require a confirmed email" switched on, set WAIT_VERIFY=1 and write the link from
// the confirmation email into /tmp/verify-url inside the container. KEEP=1 keeps the account.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';

const BASE = 'http://127.0.0.1:3000';
const PUBLIC = process.env.PUBLIC_BASE ?? 'http://127.0.0.1:3020';
const require = createRequire(import.meta.url);
await prepareZXingModule({
  overrides: { wasmBinary: new Uint8Array(readFileSync(require.resolve('zxing-wasm/reader/zxing_reader.wasm'))).buffer },
  fireImmediately: true,
});

const jar = new Map();
async function req(path, init = {}) {
  const url = path.startsWith('http') ? path : BASE + path;
  const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  const res = await fetch(url, { redirect: 'manual', ...init, headers: { ...(init.headers ?? {}), ...(cookie ? { cookie } : {}) } });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [kv] = c.split(';');
    const i = kv.indexOf('=');
    jar.set(kv.slice(0, i), kv.slice(i + 1));
  }
  return res;
}
const json = (body) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

async function decodePng(buf) {
  const { data, info } = await sharp(buf).flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = await readBarcodes({ data: new Uint8ClampedArray(data), width: info.width, height: info.height, colorSpace: 'srgb' }, { formats: ['QRCode'], tryHarder: true });
  return r.find((x) => x.isValid)?.text ?? null;
}

// ------------------------------------------------------------------ account
const email = process.env.E2E_EMAIL ?? `e2e-${Date.now()}@example.test`;
const PASSWORD = 'E2e-check-2026';
let r = await req('/api/auth/signup', json({ email, password: PASSWORD, name: 'E2E', acceptTerms: true }));
check('signup', r.status === 200 || r.status === 201, `status ${r.status}`);

// The real confirmation email: a watcher on the host reads it from the test inbox and
// drops its link here; opening it confirms the address, as a person clicking it would.
if (process.env.WAIT_VERIFY) {
  const { existsSync, readFileSync: readText } = await import('node:fs');
  let link = null;
  for (let i = 0; i < 90 && !link; i++) {
    if (existsSync('/tmp/verify-url')) link = readText('/tmp/verify-url', 'utf8').trim();
    else await new Promise((done) => setTimeout(done, 2000));
  }
  if (!link) check('verification email link received', false, 'timed out');
  else {
    const page = await fetch(link.replace(PUBLIC, BASE));
    const html = await page.text();
    check('verification link confirms the email', page.ok && !/expired|invalid|not valid/i.test(html.slice(0, 20000)), `status ${page.status}`);
  }
}

// ------------------------------------------------------------------ uploads
async function upload(name, type, bytes, kind) {
  const form = new FormData();
  form.set('file', new File([bytes], name, { type }));
  form.set('kind', kind);
  const res = await req('/api/uploads', { method: 'POST', body: form });
  const body = await res.json().catch(() => ({}));
  check(`upload ${name}`, res.ok && body.url, `status ${res.status} ${body.error ?? ''}`);
  return body;
}
const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 200 200]/Parent 2 0 R>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#4F46E5' } }).png().toBuffer();
const pdf = await upload('menu.pdf', 'application/pdf', pdfBytes, 'pdf');
const img = await upload('photo.png', 'image/png', png, 'image');
const fileRef = (u) => (u?.url ? { url: u.url, name: u.name ?? 'file', size: u.size, mimeType: u.mimeType } : undefined);

if (pdf?.url) {
  const range = await req(pdf.url, { headers: { range: 'bytes=0-7' } });
  const text = Buffer.from(await range.arrayBuffer()).toString();
  check('file byte range (iPhone media playback)', range.status === 206 && text === '%PDF-1.4' && range.headers.get('content-range')?.startsWith('bytes 0-7/'), `status ${range.status} ${range.headers.get('content-range')}`);
}

// ------------------------------------------------------------------ codes
const RISKY = { bodyShape: 'diamond', eyeFrameShape: 'cut', eyeBallShape: 'dot-grid', errorCorrection: 'M', logoPreset: 'wifi', logoSize: 34, logoPadding: 10, logoShape: 'rounded' };

const STATIC = [
  ['URL', { url: 'example.com/menu' }, 'https://example.com/menu'],
  ['WIFI', { ssid: 'Dana pani', encryption: 'NONE', password: 'x', hidden: true }, 'WIFI:T:nopass;S:Dana pani;H:true;;'],
  ['WIFI', { ssid: 'Cafe Guest', encryption: 'WPA', password: 'p@ss;1' }, 'WIFI:T:WPA;S:Cafe Guest;P:p@ss\\;1;;'],
  ['VCARD', { firstName: 'Ayesha', lastName: 'Khan', phone: '+92 300 1234567', email: 'a@example.com' }, null],
  ['EMAIL', { to: 'hi@example.com', subject: 'Hello there' }, 'mailto:hi@example.com?subject=Hello%20there'],
  ['WHATSAPP', { phone: '+92 300 1234567', message: 'Hi' }, 'https://wa.me/923001234567?text=Hi'],
  ['SMS', { phone: '+92 300 1234567', message: 'JOIN' }, 'SMSTO:+923001234567:JOIN'],
  ['PHONE', { phone: '+92 300 1234567' }, 'tel:+923001234567'],
  ['LOCATION', { latitude: '31.5204', longitude: '74.3587' }, 'https://www.google.com/maps/search/?api=1&query=31.5204%2C74.3587'],
  ['EVENT', { title: 'Party', start: '2026-11-01T18:00', end: '2026-11-01T21:00' }, null],
  ['CALENDAR', { title: 'Sync', start: '2026-11-03T10:00' }, null],
  ['CRYPTO', { coin: 'bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', label: 'My Shop' }, 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?label=My%20Shop'],
  ['TEXT', { text: 'Hello; world' }, 'Hello; world'],
];

for (const [type, content, expected] of STATIC) {
  for (const [label, design] of [['default', {}], ['risky', RISKY]]) {
    const res = await req('/api/v1/qr', json({ name: `${type} ${label}`, kind: 'STATIC', type, content, design }));
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { check(`static ${type} [${label}] create`, false, `${res.status} ${body.error ?? JSON.stringify(body.fields ?? {})}`); continue; }
    const image = await req(`/api/v1/qr/${body.data.id}/image?format=png&size=600&download=false`);
    const text = await decodePng(Buffer.from(await image.arrayBuffer()));
    const ok = expected ? text === expected : Boolean(text && (text.includes('BEGIN:VCARD') || text.includes('BEGIN:VEVENT')));
    check(`static ${type} [${label}] downloads and scans`, ok, ok ? '' : `decoded ${JSON.stringify(text)}`);
    if (type === 'EVENT' && text) check('event keeps the typed time', text.includes('DTSTART:20261101T180000'), text.split('\r\n').find((l) => l.startsWith('DTSTART')) ?? '');
  }
}

const DYNAMIC = [
  ['WEBSITE', { url: 'https://example.com/landing' }, { redirect: 'https://example.com/landing' }],
  ['PDF', { file: fileRef(pdf), title: 'Spring menu', allowDownload: true }, { page: ['Spring menu', 'Open the PDF'] }],
  ['PDF', { file: fileRef(pdf), title: 'Direct menu', directOpen: true }, { redirectStartsWith: '/api/files/' }],
  ['IMAGE_GALLERY', { title: 'Wedding photos', images: [fileRef(img)] }, { page: ['Wedding photos'] }],
  ['VCARD_PLUS', { firstName: 'Ayesha', lastName: 'Khan', phone: '+92 300 1234567', email: 'a@example.com' }, { page: ['Ayesha Khan', 'tel:+923001234567', 'Save to contacts'] }],
  ['VIDEO', { title: 'Demo video', videoUrl: 'https://www.youtube.com/shorts/aqz-KE-bpKQ' }, { page: ['Demo video', 'youtube.com/embed/aqz-KE-bpKQ'] }],
  ['LINK_LIST', { title: 'My links', links: [{ label: 'Shop', url: 'https://example.com/shop' }] }, { page: ['My links', 'https://example.com/shop'] }],
  ['SOCIAL', { title: 'Follow ALTRIX', profiles: [{ platform: 'instagram', url: 'https://instagram.com/altrix' }] }, { page: ['Follow ALTRIX', 'instagram.com/altrix'] }],
  ['AUDIO', { title: 'Audio tour', audioUrl: 'https://example.com/tour.mp3' }, { page: ['Audio tour'] }],
  ['BUSINESS', { name: 'Altrix Cafe', phone: '+92 300 1234567', whatsapp: '+92 300 1234567', address: 'Mall Road Lahore' }, { page: ['Altrix Cafe', 'tel:+923001234567', 'wa.me/923001234567'] }],
  ['COUPON', { headline: '20% off today', code: 'SAVE20' }, { page: ['20% off today', 'SAVE20'] }],
  ['APP_STORE', { appName: 'Altrix App', iosUrl: 'https://apps.apple.com/app/id1', androidUrl: 'https://play.google.com/store/apps/details?id=x' }, { page: ['Altrix App', 'apps.apple.com'] }],
  ['LANDING_PAGE', { headline: 'Big launch', buttonLabel: 'Join', buttonUrl: 'https://example.com/join' }, { page: ['Big launch', 'example.com/join'] }],
  ['PRODUCT', { name: 'Desk lamp', price: 'Rs 4,500', buyUrl: 'https://example.com/buy' }, { page: ['Desk lamp', 'example.com/buy'] }],
  ['EVENT_PAGE', { title: 'Expo night', start: '2026-11-01T18:00', venue: 'Expo Centre' }, { page: ['Expo night', 'Expo Centre'] }],
  ['MENU', { name: 'Altrix Diner', sections: [{ name: 'Mains', items: 'Biryani | 650 | Spicy' }] }, { page: ['Altrix Diner', 'Biryani'] }],
  ['FEEDBACK', { title: 'How was it?', positiveRedirectUrl: 'https://g.page/r/review' }, { page: ['How was it?'] }],
  ['PLAYLIST', { title: 'Road trip', tracks: [{ title: 'Song one', url: 'https://example.com/1' }] }, { page: ['Road trip', 'Song one'] }],
  ['GS1', { gtin: '09506000134352', url: 'https://example.com/product' }, { redirectIncludes: 'example.com' }],
  ['SMART_LINK', { url: 'https://example.com/default' }, { redirect: 'https://example.com/default' }],
];

const created = {};
for (const [type, content, expect] of DYNAMIC) {
  const res = await req('/api/v1/qr', json({ name: `${type} dyn`, kind: 'DYNAMIC', type, content, design: RISKY }));
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { check(`dynamic ${type} create`, false, `${res.status} ${body.error ?? JSON.stringify(body.fields ?? {})}`); continue; }
  created[type] = body.data;
  const image = await req(`/api/v1/qr/${body.data.id}/image?format=png&size=600&download=false`);
  const text = await decodePng(Buffer.from(await image.arrayBuffer()));
  if (!text) { check(`dynamic ${type} scans`, false, 'not decoded'); continue; }
  // Follow what a phone would open (the test stack's public host maps to the container).
  let url = text.replace(PUBLIC, BASE);
  let hops = 0;
  let final = null;
  let location = null;
  while (hops++ < 5) {
    const hop = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'x-forwarded-host': new URL(PUBLIC).host, 'x-forwarded-proto': new URL(PUBLIC).protocol.replace(':', '') } });
    if (hop.status >= 300 && hop.status < 400) {
      location = hop.headers.get('location');
      if (!location) break;
      if (location.startsWith('http') && !location.startsWith(BASE) && !location.startsWith(PUBLIC)) { final = { external: location }; break; }
      if (expect.redirectStartsWith && location.startsWith(expect.redirectStartsWith)) { final = { internal: location }; break; }
      url = location.startsWith('http') ? location.replace(PUBLIC, BASE) : BASE + location;
      continue;
    }
    final = { status: hop.status, html: await hop.text() };
    break;
  }
  if (expect.redirect) check(`dynamic ${type} scan → redirect`, final?.external === expect.redirect, JSON.stringify(final?.external ?? final?.status));
  else if (expect.redirectIncludes) check(`dynamic ${type} scan → redirect`, Boolean(final?.external?.includes(expect.redirectIncludes)), JSON.stringify(final?.external ?? final?.status));
  else if (expect.redirectStartsWith) check(`dynamic ${type} scan → opens the file directly`, Boolean(final?.internal?.startsWith(expect.redirectStartsWith)), JSON.stringify(final));
  else {
    const missing = expect.page.filter((s) => !final?.html?.includes(s));
    check(`dynamic ${type} scan → landing page`, final?.status === 200 && missing.length === 0, final?.status !== 200 ? `status ${final?.status}` : missing.length ? `missing ${missing.join(', ')}` : '');
  }
}

// ------------------------------------------------------------------ hosted extras
if (created.VCARD_PLUS) {
  const v = await req(`/api/landing/${created.VCARD_PLUS.id}/vcard`);
  const t = await v.text();
  check('vCard Plus "Save to contacts" file', v.ok && t.includes('BEGIN:VCARD') && t.includes('Khan'), `status ${v.status}`);
}
if (created.PDF) {
  const d = await req(`/api/landing/${created.PDF.id}/download`);
  check('PDF download button', d.ok && (d.headers.get('content-disposition') ?? '').includes('attachment'), `status ${d.status}`);
}
if (created.EVENT_PAGE) {
  const i = await req(`/api/landing/${created.EVENT_PAGE.id}/ics`);
  const t = await i.text();
  check('event page "Add to calendar" file', i.ok && t.includes('BEGIN:VEVENT'), `status ${i.status}`);
}
if (created.FEEDBACK) {
  const f = await fetch(`${BASE}/api/landing/${created.FEEDBACK.id}/feedback`, json({ rating: 5, comment: 'Great' }));
  const b = await f.json().catch(() => ({}));
  check('feedback form: 5-star rating is stored', f.ok && b.ok === true, `status ${f.status}`);
  // The page itself forwards 4–5 star ratings to the review link after submitting.
  const page = await (await fetch(`${BASE}/l/${created.FEEDBACK.id}`)).text();
  check('feedback page carries the review link for happy customers', page.includes('g.page/r/review'));
}

// ------------------------------------------------------------------ email + cleanup
const forgot = await fetch(`${BASE}/api/auth/forgot-password`, json({ email }));
check('forgot-password request accepted', forgot.ok, `status ${forgot.status}`);
if (!process.env.KEEP) {
  const del = await req('/api/account', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: PASSWORD, confirm: 'DELETE' }) });
  check('test account deleted (cleanup)', del.ok, `status ${del.status}`);
}

const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
