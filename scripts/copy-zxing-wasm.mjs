// Copies the QR decoder's WebAssembly binary into public/, so the scanner tool loads it
// from this site instead of a CDN (the image being decoded never leaves the browser).
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const source = require.resolve('zxing-wasm/reader/zxing_reader.wasm');
const target = join(process.cwd(), 'public', 'vendor');
mkdirSync(target, { recursive: true });
copyFileSync(source, join(target, 'zxing_reader.wasm'));
console.log('copied zxing_reader.wasm to public/vendor');
