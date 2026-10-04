// Tells IndexNow engines (Bing, Yandex, Seznam, Naver…) which public pages are new or
// changed, right after a deploy. Bing's index also feeds ChatGPT search and Copilot.
//
//   node scripts/indexnow.mjs            (run inside the app container by deploy.sh)
//
// Reads the live sitemap, compares each URL's <lastmod> with what was last submitted
// (kept in STORAGE_LOCAL_DIR/.indexnow-state.json), and submits only the difference.
// Exits 0 on any failure: indexing must never fail a deploy.
import fs from 'node:fs';
import path from 'node:path';

const base = (process.env.APP_URL || '').replace(/\/+$/, '');
const key = (process.env.INDEXNOW_KEY || '').trim();
const stateFile = path.join(process.env.STORAGE_LOCAL_DIR || '/app/storage', '.indexnow-state.json');

async function main() {
  if (!base || !key) return console.log('indexnow: APP_URL or INDEXNOW_KEY not set, skipping');

  const xml = await (await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(15000) })).text();
  const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({
    url: m[1].trim(),
    lastmod: (m[2] || '').trim(),
  }));

  let previous = {};
  try {
    previous = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    /* first run: everything is new */
  }

  const changed = entries.filter((entry) => previous[entry.url] !== entry.lastmod).map((entry) => entry.url);
  if (changed.length === 0) return console.log('indexnow: nothing changed');

  const host = new URL(base).host;
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${base}/indexnow-key.txt`, urlList: changed.slice(0, 10000) }),
    signal: AbortSignal.timeout(20000),
  });
  console.log(`indexnow: submitted ${changed.length} URL(s), HTTP ${response.status}`);

  // 200 and 202 mean accepted; only then remember what was sent.
  if (response.status === 200 || response.status === 202) {
    const next = Object.fromEntries(entries.map((entry) => [entry.url, entry.lastmod]));
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    fs.writeFileSync(stateFile, JSON.stringify(next, null, 2));
  }
}

main().catch((error) => console.log(`indexnow: skipped (${error.message})`));
