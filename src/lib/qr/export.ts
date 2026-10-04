import 'server-only';
import { buildMatrix, EYE_ORIGINS } from './matrix';
import { renderQr } from './render';
import { DEFAULT_DESIGN, type ExportFormat, type QrDesign } from './types';
import { getLogoPreset, logoPresetDataUri } from './presets';
import { readFileBuffer } from '../storage';
import { logger } from '../logger';
import { env } from '../env';
import { brandingFromSettings, cleanBrandingText, defaultBrandingText } from './branding';

export interface ExportRequest {
  data: string;
  design: Partial<QrDesign>;
  format: ExportFormat;
  /** Pixel width for raster formats, or point width for PDF. */
  size?: number;
  filenameBase?: string;
  /** Credit line under the code. Omitted: follow the platform setting. Null: none. */
  branding?: string | null;
}

/** The platform's credit line; a settings outage still prints the default, not nothing. */
async function platformBranding(): Promise<string | null> {
  try {
    const { getSettings } = await import('../settings');
    return brandingFromSettings(await getSettings(), env.appUrl);
  } catch {
    return defaultBrandingText(env.appUrl);
  }
}

export interface ExportResult {
  body: Buffer;
  contentType: string;
  filename: string;
}

const CONTENT_TYPES: Record<ExportFormat, string> = {
  svg: 'image/svg+xml; charset=utf-8',
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
  eps: 'application/postscript',
};

function safeFilename(base: string, ext: string): string {
  const cleaned = (base || 'qr-altrix')
    .replace(/[^a-z0-9-_ ]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return `${cleaned || 'qr-altrix'}.${ext}`;
}

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
};

/**
 * Inlines the logo as a data URI. Raster/PDF renderers cannot fetch remote images, so
 * the logo has to travel inside the SVG.
 */
export async function resolveLogoDataUri(design: Partial<QrDesign>): Promise<string | null> {
  if (design.logoUrl) {
    const url = design.logoUrl;
    if (url.startsWith('data:')) return url;
    try {
      // Local storage assets are served from /api/files/<key>
      const localMatch = /^\/api\/files\/(.+)$/.exec(url);
      if (localMatch) {
        const key = decodeURIComponent(localMatch[1]);
        const buffer = await readFileBuffer(key);
        if (buffer) {
          const ext = key.split('.').pop()?.toLowerCase() ?? 'png';
          return `data:${MIME_BY_EXT[ext] ?? 'image/png'};base64,${buffer.toString('base64')}`;
        }
      }
      if (/^https?:\/\//i.test(url)) {
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const type = res.headers.get('content-type') ?? 'image/png';
          if (type.startsWith('image/')) {
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.byteLength <= 3 * 1024 * 1024) {
              return `data:${type};base64,${buf.toString('base64')}`;
            }
          }
        }
      }
    } catch (error) {
      logger.warn('logo inline failed', { error: (error as Error).message });
    }
  }
  const preset = getLogoPreset(design.logoPreset);
  return preset ? logoPresetDataUri(preset) : null;
}

/** Minimal EPS writer so print shops with legacy workflows are still served. */
function renderEps(data: string, design: QrDesign, branding: string | null = null): Buffer {
  const matrix = buildMatrix(data, design.errorCorrection);
  const quiet = Math.max(0, Math.min(12, Math.round(design.margin)));
  const units = matrix.size + quiet * 2;
  const scale = 8; // points per module → ~ 9 cm at 33 modules
  const side = units * scale;

  const hexToPs = (hex: string): string => {
    const clean = (hex || '#000000').trim().replace('#', '');
    const full =
      clean.length === 3
        ? clean
            .split('')
            .map((c) => c + c)
            .join('')
        : clean.slice(0, 6).padEnd(6, '0');
    if (!/^[0-9a-f]{6}$/i.test(full)) return '0 0 0';
    return [full.slice(0, 2), full.slice(2, 4), full.slice(4, 6)]
      .map((c) => (parseInt(c, 16) / 255).toFixed(4))
      .join(' ');
  };

  const fg = design.invert ? design.bgColor : design.fgColor;
  const bg = design.invert ? design.fgColor : design.bgColor;

  // Credit line in a band under the code, sized like the SVG renderer's.
  const credit = cleanBrandingText(branding);
  const fontPts = credit ? Math.min(2.1, Math.max(1.15, (units * 0.9) / (credit.length * 0.56))) * scale : 0;
  const band = credit ? Math.round(fontPts * 2.2) : 0;
  const height = side + band;
  // PostScript has no opacity: blend the ink a quarter of the way to the background.
  const mix = (a: string, b: string) =>
    hexToPs(a)
      .split(' ')
      .map((value, index) => (Number(value) * 0.75 + Number(hexToPs(b).split(' ')[index]) * 0.25).toFixed(4))
      .join(' ');
  // Helvetica's standard encoding has the middle dot at octal 267; anything else outside
  // ASCII is replaced so the file stays valid Latin-1 PostScript.
  const psText = (credit ?? '')
    .replace(/[\\()]/g, (c) => `\\${c}`)
    .replace(/·/g, '\\267')
    .replace(/[^\x20-\x7e]/g, '-');

  const lines: string[] = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    '%%Creator: QR ALTRIX',
    '%%Title: QR ALTRIX code',
    `%%BoundingBox: 0 0 ${side} ${height}`,
    '%%EndComments',
    '/m { moveto } bind def',
    '/rf { 4 2 roll moveto 1 index 0 rlineto 0 exch rlineto neg 0 rlineto closepath fill } bind def',
  ];

  if (!design.transparentBg) {
    lines.push(`${hexToPs(bg)} setrgbcolor`, `0 0 ${side} ${height} rf`);
  }
  if (credit) {
    lines.push(
      `${design.transparentBg ? hexToPs('#475569') : mix(fg, bg)} setrgbcolor`,
      `/Helvetica-Bold findfont ${fontPts.toFixed(2)} scalefont setfont`,
      `(${psText}) dup stringwidth pop 2 div ${side / 2} exch sub ${(band / 2 - fontPts * 0.36).toFixed(2)} moveto show`,
    );
  }
  lines.push(`${hexToPs(fg)} setrgbcolor`);

  const dots = design.bodyShape === 'dots';
  const eyes = EYE_ORIGINS(matrix.size);
  const inEye = (x: number, y: number) => eyes.some(([ox, oy]) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7);

  for (let y = 0; y < matrix.size; y += 1) {
    for (let x = 0; x < matrix.size; x += 1) {
      if (!matrix.get(x, y)) continue;
      const px = (x + quiet) * scale;
      // EPS origin is bottom-left; the matrix is top-left based.
      const py = height - (y + quiet + 1) * scale;
      if (dots && !inEye(x, y)) {
        const r = scale * 0.44;
        lines.push(`newpath ${(px + scale / 2).toFixed(2)} ${(py + scale / 2).toFixed(2)} ${r.toFixed(2)} 0 360 arc fill`);
      } else {
        lines.push(`${px.toFixed(2)} ${py.toFixed(2)} ${scale} ${scale} rf`);
      }
    }
  }

  lines.push('showpage', '%%EOF');
  return Buffer.from(lines.join('\n'), 'latin1');
}

async function svgToPdf(svg: string, widthPt: number, heightPt: number): Promise<Buffer> {
  const [{ default: PDFDocument }, { default: SVGtoPDF }] = await Promise.all([
    import('pdfkit'),
    import('svg-to-pdfkit'),
  ]);

  return await new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [widthPt, heightPt],
        margin: 0,
        info: { Title: 'QR ALTRIX code', Creator: 'QR ALTRIX', Producer: 'QR ALTRIX' },
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      SVGtoPDF(doc, svg, 0, 0, { width: widthPt, height: heightPt, assumePt: true, preserveAspectRatio: 'xMidYMid meet' });
      doc.end();
    } catch (error) {
      reject(error as Error);
    }
  });
}

/**
 * The SVG is rasterised larger than the requested size and scaled down, which keeps
 * curved modules and logos crisp. A fixed density of 384 dpi (5.3x) did that, but at
 * the "Huge · 4096 px" size it asked libvips for a 21,845 px square — 477 million
 * pixels, past sharp's 268M input limit — so every 4096 px PNG, JPEG and WebP failed.
 * Supersampling is now capped so the intermediate raster never exceeds 8192 px a side
 * (67M pixels, ~270 MB at most), which is still 2x at the largest size.
 */
export const MAX_RASTER_SIDE = 8192;

export function rasterDensity(size: number): number {
  const scale = Math.min(384 / 72, MAX_RASTER_SIDE / Math.max(1, size));
  return Math.max(72, Math.floor(72 * scale));
}

export async function exportQr(request: ExportRequest): Promise<ExportResult> {
  const design: QrDesign = { ...DEFAULT_DESIGN, ...request.design };
  const size = Math.max(64, Math.min(4096, request.size ?? 1024));
  const logoDataUri = await resolveLogoDataUri(design);
  const branding = request.branding !== undefined ? cleanBrandingText(request.branding) : await platformBranding();
  const rendered = renderQr(request.data, design, { size, logoDataUri, idPrefix: 'qa', branding });
  const base = request.filenameBase ?? 'qr-altrix';
  const ratio = rendered.units.height / rendered.units.width;

  switch (request.format) {
    case 'svg':
      return {
        body: Buffer.from(rendered.svg, 'utf8'),
        contentType: CONTENT_TYPES.svg,
        filename: safeFilename(base, 'svg'),
      };

    case 'eps':
      return {
        body: renderEps(request.data, design, branding),
        contentType: CONTENT_TYPES.eps,
        filename: safeFilename(base, 'eps'),
      };

    case 'pdf': {
      // 1 module ≈ 8pt keeps a standard 33-module code at a printable ~9 cm.
      const widthPt = Math.round(rendered.units.width * 8);
      const heightPt = Math.round(rendered.units.height * 8);
      try {
        const pdf = await svgToPdf(rendered.svg, widthPt, heightPt);
        return { body: pdf, contentType: CONTENT_TYPES.pdf, filename: safeFilename(base, 'pdf') };
      } catch (error) {
        logger.warn('vector pdf failed, embedding raster instead', { error: (error as Error).message });
        const sharp = (await import('sharp')).default;
        const png = await sharp(Buffer.from(rendered.svg), { density: rasterDensity(size) })
          .resize({ width: Math.min(size * 2, MAX_RASTER_SIDE) })
          .png()
          .toBuffer();
        const { default: PDFDocument } = await import('pdfkit');
        const pdf = await new Promise<Buffer>((resolve, reject) => {
          const doc = new PDFDocument({ size: [widthPt, heightPt], margin: 0 });
          const chunks: Buffer[] = [];
          doc.on('data', (c: Buffer) => chunks.push(c));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);
          doc.image(png, 0, 0, { width: widthPt, height: heightPt });
          doc.end();
        });
        return { body: pdf, contentType: CONTENT_TYPES.pdf, filename: safeFilename(base, 'pdf') };
      }
    }

    default: {
      const sharp = (await import('sharp')).default;
      let pipeline = sharp(Buffer.from(rendered.svg), { density: rasterDensity(size) }).resize({
        width: size,
        height: Math.round(size * ratio),
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: design.transparentBg ? 0 : 1 },
      });

      if (request.format === 'jpeg') {
        pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 92, chromaSubsampling: '4:4:4' });
      } else if (request.format === 'webp') {
        pipeline = pipeline.webp({ quality: 94, lossless: false });
      } else {
        pipeline = pipeline.png({ compressionLevel: 9 });
      }

      const body = await pipeline.toBuffer();
      const ext = request.format === 'jpeg' ? 'jpg' : request.format;
      return { body, contentType: CONTENT_TYPES[request.format], filename: safeFilename(base, ext) };
    }
  }
}

export function exportContentType(format: ExportFormat): string {
  return CONTENT_TYPES[format];
}
