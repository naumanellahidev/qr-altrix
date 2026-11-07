// Google Autocomplete harvest: seeds x ("", " a".." z"). Writes suggestions.json {query: {count, bestRank, seeds[]}}.
import { writeFileSync } from 'node:fs';
const DEFAULT_SEEDS = [
  'qr code', 'qr code generator', 'free qr code generator', 'qr code for', 'how to make a qr code', 'how to create a qr code',
  'how to scan a qr code', 'qr code scanner', 'dynamic qr code', 'static qr code', 'qr code with logo', 'qr code size',
  'qr code expire', 'qr code not working', 'qr code menu', 'qr code wifi', 'wifi qr code', 'qr code business card',
  'qr code google review', 'qr code google form', 'qr code instagram', 'qr code whatsapp', 'qr code pdf', 'qr code video',
  'qr code link', 'qr code for website', 'qr code tracking', 'qr code payment', 'qr code wedding', 'qr code restaurant',
  'qr code real estate', 'qr code event', 'qr code feedback', 'qr code vcard', 'qr code youtube', 'qr code spotify',
  'qr code facebook', 'qr code linkedin', 'qr code tiktok', 'qr code email', 'qr code sms', 'qr code location',
  'qr code safe', 'qr code scam', 'qr code meaning', 'qr code print', 'qr code bulk', 'qr code free no sign up',
  'qr code iphone', 'qr code android', 'qr code canva', 'qr code word', 'qr code excel', 'qr code google docs',
  'qr code app store', 'qr code poster', 'qr code flyer', 'qr code packaging', 'qr code inventory', 'qr code attendance',
  'is qr code', 'can qr code', 'why qr code', 'what is a qr code', 'qr code vs barcode', 'qr code color',
];
// Override with SEEDS='seed one|seed two' and OUT=./file.json
const seeds = process.env.SEEDS ? process.env.SEEDS.split('|').filter(Boolean) : DEFAULT_SEEDS;
const letters = ['', ...'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => ' ' + c)];
const jobs = seeds.flatMap((s) => letters.map((l) => ({ seed: s, q: s + l })));
const out = new Map();
let done = 0, fail = 0;
async function fetchOne({ seed, q }) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=${process.env.GL || 'us'}&q=${encodeURIComponent(q)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0' } });
      if (!r.ok) throw new Error(r.status);
      const [, list] = JSON.parse(await r.text());
      list.forEach((s, i) => {
        const k = s.toLowerCase().trim();
        const e = out.get(k) ?? { count: 0, bestRank: 99, seeds: new Set() };
        e.count++; e.bestRank = Math.min(e.bestRank, i); e.seeds.add(seed);
        out.set(k, e);
      });
      return;
    } catch { await new Promise((res) => setTimeout(res, 800 * (attempt + 1))); }
  }
  fail++;
}
const queue = [...jobs];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) { await fetchOne(queue.shift()); done++; await new Promise((r) => setTimeout(r, 80)); }
}));
const obj = Object.fromEntries([...out].map(([k, v]) => [k, { count: v.count, bestRank: v.bestRank, seeds: [...v.seeds] }]));
writeFileSync(new URL(process.env.OUT || './suggestions.json', import.meta.url), JSON.stringify(obj, null, 1));
console.log(`requests ${done}, failed ${fail}, unique suggestions ${out.size}`);
