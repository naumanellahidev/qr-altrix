import { ImageResponse } from 'next/og';
import { renderQr } from '@/lib/qr/render';
import { DEFAULT_DESIGN } from '@/lib/qr/types';

/**
 * The social card shown when a link to the site is shared (WhatsApp, Facebook, X,
 * LinkedIn, Slack…) and used by search and AI previews. The QR code in it is drawn by
 * the product's own renderer. Wording avoids expiry claims: the card is built once, at
 * build time, and cannot read the operator's live settings.
 */
export const alt = 'QR ALTRIX – free QR code generator with unlimited dynamic QR codes and live scan analytics';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4F46E5"/><stop offset="100%" stop-color="#0EA5E9"/></linearGradient></defs><rect width="48" height="48" rx="13" fill="url(#g)"/><g fill="#fff"><path fill-rule="evenodd" d="M10 10h11v11H10V10zm3 3v5h5v-5h-5zm14-3h11v11H27V10zm3 3v5h5v-5h-5zM10 27h11v11H10V27zm3 3v5h5v-5h-5z"/><path d="M25 25h3.2v3.2H25V25zm5 2.4h3.2v3.2H30v-3.2zm-2.6 5h3.2v3.2h-3.2v-3.2zm5.2 0H36v3.2h-3.2v-3.2zm2.6-5.2H38v3.2h-2.6v-3.2z"/></g></svg>',
  );

/**
 * Brand display face for the headline. Fetched at build time as TTF (Google serves TTF
 * to clients that send no browser user agent); if the network is unavailable the card
 * falls back to the built-in font instead of failing the build.
 */
async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`, {
        signal: AbortSignal.timeout(8000),
      })
    ).text();
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url, { signal: AbortSignal.timeout(8000) })).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [display, body] = await Promise.all([loadFont('Plus Jakarta Sans', 800), loadFont('Inter', 500)]);
  const fonts = [
    ...(display ? [{ name: 'Display', data: display, weight: 800 as const, style: 'normal' as const }] : []),
    ...(body ? [{ name: 'Body', data: body, weight: 500 as const, style: 'normal' as const }] : []),
  ];
  const qr = renderQr(
    'https://qraltrix.co.uk',
    {
      ...DEFAULT_DESIGN,
      bodyShape: 'rounded',
      eyeFrameShape: 'rounded',
      gradientEnabled: true,
      gradientFrom: '#4F46E5',
      gradientTo: '#0EA5E9',
      frame: 'none',
    },
    { size: 340, idPrefix: 'og', branding: null },
  );
  const qrSrc = `data:image/svg+xml;utf8,${encodeURIComponent(qr.svg)}`;
  

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #0B1120 0%, #131A3A 55%, #0B2340 100%)',
          color: '#F8FAFC',
          fontFamily: body ? 'Body' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MARK} width={56} height={56} alt="" />
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
              QR <span style={{ color: '#7DD3FC', marginLeft: 8 }}>ALTRIX</span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 40,
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -2.5,
              fontFamily: display ? 'Display' : 'sans-serif',
            }}
          >
            Free QR Code Generator
          </div>
          <div style={{ display: 'flex', marginTop: 22, fontSize: 30, lineHeight: 1.35, color: '#CBD5E1' }}>
            Unlimited dynamic QR codes, your logo and colours, live scan analytics.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
            {['No card needed', 'No paid plans', 'Bulk & analytics'].map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: '1px solid rgba(125, 211, 252, 0.35)',
                  background: 'rgba(79, 70, 229, 0.18)',
                  fontSize: 22,
                  color: '#E0E7FF',
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: 40, fontSize: 24, color: '#94A3B8' }}>qraltrix.co.uk</div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 32,
            border: '6px solid #4F46E5',
            background: '#FFFFFF',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} width={340} height={340} alt="" style={{ margin: 18 }} />
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              padding: '16px 0 18px',
              background: '#4F46E5',
              color: '#FFFFFF',
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: 3,
              fontFamily: display ? 'Display' : 'sans-serif',
            }}
          >
            SCAN ME
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
