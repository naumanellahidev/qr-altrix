'use client';

import * as React from 'react';
import {
  CalendarPlus, Clock, Copy, Download, ExternalLink, FileText, Globe, Mail, MapPin, Music,
  Phone, Play, Share2, Star, Ticket, UserPlus, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccentButton, LandingHeader, LandingShell } from '@/components/landing/shell';
import { toast } from 'sonner';

/**
 * Hosted landing views, one per dynamic QR type. These are the pages a visitor sees
 * after scanning, so they are built mobile-first: large tap targets, no clutter, and the
 * primary action always above the fold.
 */

type Json = Record<string, unknown>;

export interface LandingProps {
  qrId: string;
  type: string;
  name: string;
  content: Json;
}

// ---------------------------------------------------------------- small helpers

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

function fileUrl(value: unknown): string | null {
  if (typeof value === 'string') return value || null;
  if (value && typeof value === 'object' && 'url' in value) {
    const url = (value as { url?: unknown }).url;
    return typeof url === 'string' && url !== '' ? url : null;
  }
  return null;
}

interface FileRef {
  url: string;
  name?: string;
  caption?: string;
}

function fileList(value: unknown): FileRef[] {
  if (!Array.isArray(value)) return [];
  const out: FileRef[] = [];
  for (const item of value) {
    const url = fileUrl(item);
    if (!url) continue;
    const meta = (item ?? {}) as { name?: unknown; caption?: unknown };
    out.push({ url, name: str(meta.name) || undefined, caption: str(meta.caption) || undefined });
  }
  return out;
}

function rows(value: unknown): Json[] {
  return Array.isArray(value) ? (value.filter((item) => item && typeof item === 'object') as Json[]) : [];
}

function formatDateTime(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5 shadow-card', className)}>{children}</div>
  );
}

function LinkRow({
  href,
  label,
  detail,
  icon,
}: {
  href: string;
  label: string;
  detail?: string;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      {icon ? (
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white [&_svg]:size-4"
          style={{ background: 'var(--landing-accent)' }}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium">{label}</span>
        {detail ? <span className="block truncate text-[12.5px] text-muted-foreground">{detail}</span> : null}
      </span>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

const SOCIAL_LABELS: Record<string, string> = {
  website: 'Website', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube',
  x: 'X', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', telegram: 'Telegram', snapchat: 'Snapchat',
  pinterest: 'Pinterest', threads: 'Threads', spotify: 'Spotify', github: 'GitHub', behance: 'Behance',
  dribbble: 'Dribbble',
};

// ----------------------------------------------------------------------- views

function PdfView({ content, qrId }: LandingProps) {
  const url = fileUrl(content.file);
  const title = str(content.title, 'Document');
  const allowDownload = content.allowDownload !== false;

  return (
    <LandingShell accent="#334155" width="wide">
      <LandingHeader title={title} subtitle={str(content.description) || null} />
      {url ? (
        <>
          <Card className="overflow-hidden p-0">
            <object data={url} type="application/pdf" className="h-[70dvh] w-full">
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <FileText className="size-8 text-muted-foreground" />
                <p className="text-[13.5px] text-muted-foreground">
                  Your browser cannot show PDFs inline. Open it instead.
                </p>
                <AccentButton href={url} className="max-w-xs">
                  Open the PDF <ExternalLink className="size-4" />
                </AccentButton>
              </div>
            </object>
          </Card>
          {allowDownload ? (
            <div className="mt-4">
              <AccentButton href={`/api/landing/${qrId}/download`} download>
                <Download className="size-4" /> Download PDF
              </AccentButton>
            </div>
          ) : null}
        </>
      ) : (
        <Card>
          <p className="text-center text-[13.5px] text-muted-foreground">This document has not been uploaded yet.</p>
        </Card>
      )}
    </LandingShell>
  );
}

function GalleryView({ content }: LandingProps) {
  const images = fileList(content.images);
  const [active, setActive] = React.useState<number | null>(null);
  const allowDownload = content.allowDownload === true;

  return (
    <LandingShell accent="#0EA5E9" width="wide">
      <LandingHeader title={str(content.title, 'Gallery')} subtitle={str(content.description) || null} />

      {images.length === 0 ? (
        <Card>
          <p className="text-center text-[13.5px] text-muted-foreground">No images have been added yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption ?? image.name ?? ''}
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </button>
          ))}
        </div>
      )}

      {active !== null && images[active] ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active].url}
            alt={images[active].caption ?? ''}
            className="max-h-[85dvh] max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-2 px-4 text-center">
            {images[active].caption ? (
              <p className="text-[13px] text-white/90">{images[active].caption}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-[12.5px] text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((current) => (current === null ? null : (current - 1 + images.length) % images.length));
                }}
              >
                Previous
              </button>
              <span className="text-[12px] text-white/70">
                {active + 1} / {images.length}
              </span>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-[12.5px] text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((current) => (current === null ? null : (current + 1) % images.length));
                }}
              >
                Next
              </button>
              {allowDownload ? (
                <a
                  href={images[active].url}
                  download
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-[12.5px] text-white"
                >
                  Download
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </LandingShell>
  );
}

function VCardPlusView({ content, qrId }: LandingProps) {
  const name = `${str(content.firstName)} ${str(content.lastName)}`.trim() || 'Contact';
  const photo = fileUrl(content.photo);
  const socials = rows(content.socials);

  return (
    <LandingShell accent={content.coverColor}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="h-24 w-full" style={{ background: 'var(--landing-accent)' }} />
        <div className="-mt-12 px-5 pb-5">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              className="size-24 rounded-2xl border-4 border-card object-cover shadow-soft"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-2xl border-4 border-card bg-surface-muted text-[26px] font-semibold shadow-soft">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <h1 className="mt-3 font-display text-[22px] font-bold tracking-[-0.02em]">{name}</h1>
          {str(content.jobTitle) || str(content.company) ? (
            <p className="text-[13.5px] text-muted-foreground">
              {[str(content.jobTitle), str(content.company)].filter(Boolean).join(' · ')}
            </p>
          ) : null}
          {str(content.about) ? (
            <p className="mt-3 whitespace-pre-line text-[13.5px] leading-6 text-muted-foreground">
              {str(content.about)}
            </p>
          ) : null}

          <div className="mt-5">
            <AccentButton href={`/api/landing/${qrId}/vcard`} download>
              <UserPlus className="size-4" /> Save to contacts
            </AccentButton>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {str(content.phone) ? (
          <LinkRow href={`tel:${str(content.phone)}`} label={str(content.phone)} detail="Mobile" icon={<Phone />} />
        ) : null}
        {str(content.phoneWork) ? (
          <LinkRow href={`tel:${str(content.phoneWork)}`} label={str(content.phoneWork)} detail="Work" icon={<Phone />} />
        ) : null}
        {str(content.email) ? (
          <LinkRow href={`mailto:${str(content.email)}`} label={str(content.email)} detail="Email" icon={<Mail />} />
        ) : null}
        {str(content.website) ? (
          <LinkRow href={str(content.website)} label={str(content.website).replace(/^https?:\/\//, '')} detail="Website" icon={<Globe />} />
        ) : null}
        {str(content.address) ? (
          <LinkRow
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str(content.address))}`}
            label={str(content.address)}
            detail="Address"
            icon={<MapPin />}
          />
        ) : null}
        {socials.map((social, index) => {
          const url = str(social.url);
          if (!url) return null;
          const platform = str(social.platform, 'website');
          return (
            <LinkRow
              key={`${platform}-${index}`}
              href={url}
              label={SOCIAL_LABELS[platform] ?? platform}
              detail={url.replace(/^https?:\/\//, '')}
              icon={<Share2 />}
            />
          );
        })}
      </div>
    </LandingShell>
  );
}

function embedUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (/(^|\.)youtube\.com$/.test(url.hostname)) {
      const id = url.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (url.pathname.startsWith('/embed/')) return raw;
    }
    if (url.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${url.pathname}`;
    }
    if (/(^|\.)vimeo\.com$/.test(url.hostname)) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

function VideoView({ content }: LandingProps) {
  const direct = fileUrl(content.file);
  const link = str(content.videoUrl);
  const embed = link ? embedUrl(link) : null;

  return (
    <LandingShell accent="#DC2626" width="wide">
      <LandingHeader title={str(content.title, 'Video')} subtitle={str(content.description) || null} />
      <Card className="overflow-hidden p-0">
        {embed ? (
          <div className="aspect-video w-full">
            <iframe
              src={embed}
              title={str(content.title, 'Video')}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : direct || link ? (
          <video
            src={direct ?? link}
            controls
            playsInline
            autoPlay={content.autoplay === true}
            muted={content.autoplay === true}
            className="aspect-video w-full bg-black"
          />
        ) : (
          <p className="p-8 text-center text-[13.5px] text-muted-foreground">No video has been added yet.</p>
        )}
      </Card>
      {link && !embed ? (
        <div className="mt-4">
          <AccentButton href={link}>
            Open original <ExternalLink className="size-4" />
          </AccentButton>
        </div>
      ) : null}
    </LandingShell>
  );
}

function LinkListView({ content }: LandingProps) {
  const links = rows(content.links);
  return (
    <LandingShell accent={content.accentColor}>
      <LandingHeader
        title={str(content.title, 'Links')}
        subtitle={str(content.subtitle) || null}
        logoUrl={fileUrl(content.avatar)}
      />
      <div className="space-y-2.5">
        {links.length === 0 ? (
          <Card>
            <p className="text-center text-[13.5px] text-muted-foreground">No links have been added yet.</p>
          </Card>
        ) : null}
        {links.map((link, index) => {
          const url = str(link.url);
          if (!url) return null;
          return (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl px-5 py-4 text-center font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:brightness-105"
              style={{ background: 'var(--landing-accent)' }}
            >
              <span className="block text-[14.5px]">{str(link.label, url)}</span>
              {str(link.description) ? (
                <span className="mt-0.5 block text-[12px] font-normal text-white/80">{str(link.description)}</span>
              ) : null}
            </a>
          );
        })}
      </div>
    </LandingShell>
  );
}

function SocialView({ content }: LandingProps) {
  const profiles = rows(content.profiles);
  return (
    <LandingShell accent={content.accentColor}>
      <LandingHeader
        title={str(content.title, 'Follow')}
        subtitle={str(content.bio) || null}
        logoUrl={fileUrl(content.avatar)}
      />
      <div className="space-y-2">
        {profiles.map((profile, index) => {
          const url = str(profile.url);
          if (!url) return null;
          const platform = str(profile.platform, 'website');
          return (
            <LinkRow
              key={`${platform}-${index}`}
              href={url}
              label={SOCIAL_LABELS[platform] ?? platform}
              detail={url.replace(/^https?:\/\//, '')}
              icon={<Share2 />}
            />
          );
        })}
      </div>
    </LandingShell>
  );
}

function AudioView({ content }: LandingProps) {
  const src = fileUrl(content.file) ?? str(content.audioUrl) ?? '';
  const cover = fileUrl(content.cover);
  return (
    <LandingShell accent="#9333EA">
      <Card className="text-center">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="mx-auto mb-4 aspect-square w-48 rounded-2xl object-cover shadow-soft" />
        ) : (
          <span
            className="mx-auto mb-4 flex size-24 items-center justify-center rounded-2xl text-white"
            style={{ background: 'var(--landing-accent)' }}
          >
            <Music className="size-9" />
          </span>
        )}
        <h1 className="font-display text-[20px] font-bold tracking-[-0.02em]">{str(content.title, 'Audio')}</h1>
        {str(content.artist) ? <p className="text-[13.5px] text-muted-foreground">{str(content.artist)}</p> : null}

        {src ? (
          <>
            <audio src={src} controls className="mt-5 w-full" />
            {content.allowDownload === true ? (
              <div className="mt-4">
                <AccentButton href={src} download>
                  <Download className="size-4" /> Download
                </AccentButton>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-[13.5px] text-muted-foreground">No audio has been added yet.</p>
        )}
      </Card>
    </LandingShell>
  );
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function BusinessView({ content }: LandingProps) {
  const cover = fileUrl(content.cover);
  const hours = rows(content.hours).sort(
    (a, b) => DAY_ORDER.indexOf(str(a.day)) - DAY_ORDER.indexOf(str(b.day)),
  );
  const services = rows(content.services);

  return (
    <LandingShell accent={content.accentColor} width="wide">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="mb-5 h-40 w-full rounded-2xl border border-border object-cover" />
      ) : null}

      <LandingHeader
        title={str(content.name, 'Business')}
        subtitle={str(content.tagline) || null}
        logoUrl={fileUrl(content.logo)}
        align="left"
      />

      {str(content.about) ? (
        <Card className="mb-4">
          <p className="whitespace-pre-line text-[13.5px] leading-6 text-muted-foreground">{str(content.about)}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {str(content.phone) ? (
            <LinkRow href={`tel:${str(content.phone)}`} label="Call us" detail={str(content.phone)} icon={<Phone />} />
          ) : null}
          {str(content.whatsapp) ? (
            <LinkRow
              href={`https://wa.me/${str(content.whatsapp).replace(/[^\d]/g, '')}`}
              label="WhatsApp"
              detail={str(content.whatsapp)}
              icon={<Share2 />}
            />
          ) : null}
          {str(content.email) ? (
            <LinkRow href={`mailto:${str(content.email)}`} label="Email" detail={str(content.email)} icon={<Mail />} />
          ) : null}
          {str(content.website) ? (
            <LinkRow href={str(content.website)} label="Website" detail={str(content.website).replace(/^https?:\/\//, '')} icon={<Globe />} />
          ) : null}
          {str(content.address) ? (
            <LinkRow
              href={str(content.mapsUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str(content.address))}`}
              label="Find us"
              detail={str(content.address)}
              icon={<MapPin />}
            />
          ) : null}
        </div>

        {hours.length > 0 ? (
          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-[14px] font-semibold">
              <Clock className="size-4" /> Opening hours
            </h2>
            <ul className="space-y-1.5">
              {hours.map((row, index) => (
                <li key={index} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-muted-foreground">{str(row.day)}</span>
                  <span className="font-medium">
                    {row.closed === true || (!str(row.open) && !str(row.close))
                      ? 'Closed'
                      : `${str(row.open, '—')} – ${str(row.close, '—')}`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>

      {services.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-3 text-[14px] font-semibold">What we offer</h2>
          <ul className="divide-y divide-border">
            {services.map((service, index) => (
              <li key={index} className="flex items-start justify-between gap-4 py-2.5">
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium">{str(service.name)}</span>
                  {str(service.detail) ? (
                    <span className="block text-[12.5px] text-muted-foreground">{str(service.detail)}</span>
                  ) : null}
                </span>
                {str(service.price) ? (
                  <span className="shrink-0 text-[13.5px] font-semibold">{str(service.price)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </LandingShell>
  );
}

function CouponView({ content }: LandingProps) {
  const code = str(content.code);
  const validUntil = str(content.validUntil);
  const expired = validUntil ? new Date(validUntil) < new Date(new Date().toDateString()) : false;

  return (
    <LandingShell accent={content.accentColor}>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="px-6 pb-6 pt-7 text-center" style={{ background: 'var(--landing-accent)' }}>
          {fileUrl(content.logo) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl(content.logo) as string} alt="" className="mx-auto mb-3 h-12 rounded-lg bg-white/90 object-contain p-1" />
          ) : null}
          {str(content.business) ? (
            <p className="text-[12.5px] font-medium uppercase tracking-wide text-white/80">{str(content.business)}</p>
          ) : null}
          <h1 className="mt-1 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-white">
            {str(content.headline, 'Special offer')}
          </h1>
        </div>

        {/* Perforation line, drawn rather than imported */}
        <div className="relative h-4">
          <div className="absolute inset-x-5 top-1/2 border-t border-dashed border-border" />
          <div className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-background" />
          <div className="absolute -right-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-background" />
        </div>

        <div className="space-y-4 px-6 pb-6">
          {str(content.description) ? (
            <p className="text-center text-[13.5px] leading-6 text-muted-foreground">{str(content.description)}</p>
          ) : null}

          {code ? (
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(code).then(() => toast.success('Coupon code copied'));
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-muted/60 px-4 py-3.5 font-mono text-[17px] font-bold tracking-[0.12em] transition-colors hover:border-primary/40"
            >
              {code}
              <Copy className="size-4 text-muted-foreground" />
            </button>
          ) : null}

          {str(content.buttonUrl) ? (
            <AccentButton href={str(content.buttonUrl)}>
              {str(content.buttonLabel, 'Redeem now')} <ExternalLink className="size-4" />
            </AccentButton>
          ) : null}

          {validUntil ? (
            <p className={cn('text-center text-[12.5px]', expired ? 'text-destructive' : 'text-muted-foreground')}>
              {expired ? 'This offer has expired' : `Valid until ${new Date(validUntil).toLocaleDateString()}`}
            </p>
          ) : null}

          {str(content.terms) ? (
            <details className="rounded-xl border border-border bg-surface-muted/40 p-3">
              <summary className="cursor-pointer text-[12.5px] font-medium">Terms and conditions</summary>
              <p className="mt-2 whitespace-pre-line text-[12px] leading-5 text-muted-foreground">
                {str(content.terms)}
              </p>
            </details>
          ) : null}
        </div>
      </div>
    </LandingShell>
  );
}

function AppStoreView({ content }: LandingProps) {
  const ios = str(content.iosUrl);
  const android = str(content.androidUrl);
  const other = str(content.otherUrl);

  React.useEffect(() => {
    if (content.autoRedirect === false) return;
    const ua = navigator.userAgent.toLowerCase();
    const target = /iphone|ipad|ipod/.test(ua) ? ios : /android/.test(ua) ? android : '';
    if (target) {
      const timer = window.setTimeout(() => window.location.replace(target), 600);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [content.autoRedirect, ios, android]);

  return (
    <LandingShell accent="#0F172A">
      <Card className="text-center">
        {fileUrl(content.icon) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fileUrl(content.icon) as string} alt="" className="mx-auto mb-4 size-20 rounded-2xl object-cover shadow-soft" />
        ) : null}
        <h1 className="font-display text-[21px] font-bold tracking-[-0.02em]">{str(content.appName, 'Our app')}</h1>
        {str(content.description) ? (
          <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">{str(content.description)}</p>
        ) : null}

        <div className="mt-5 space-y-2.5">
          {ios ? (
            <AccentButton href={ios}>
              <Play className="size-4" /> Download on the App Store
            </AccentButton>
          ) : null}
          {android ? (
            <a
              href={android}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-[14.5px] font-semibold transition-colors hover:bg-surface-muted"
            >
              <Play className="size-4" /> Get it on Google Play
            </a>
          ) : null}
          {other ? (
            <a
              href={other}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[13.5px] font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Other platforms
            </a>
          ) : null}
        </div>

        {content.autoRedirect !== false ? (
          <p className="mt-4 text-[12px] text-muted-foreground">Taking you to the right store…</p>
        ) : null}
      </Card>
    </LandingShell>
  );
}

function LandingPageView({ content }: LandingProps) {
  const highlights = rows(content.highlights);
  const image = fileUrl(content.image);
  return (
    <LandingShell accent={content.accentColor} width="wide">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="mb-6 w-full rounded-2xl border border-border object-cover" />
      ) : null}
      <LandingHeader title={str(content.headline, 'Welcome')} subtitle={str(content.subheadline) || null} />

      {str(content.body) ? (
        <Card className="mb-5">
          <p className="whitespace-pre-line text-[14px] leading-7 text-muted-foreground">{str(content.body)}</p>
        </Card>
      ) : null}

      {highlights.length > 0 ? (
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {highlights.map((item, index) => (
            <Card key={index}>
              <p className="text-[14px] font-semibold">{str(item.title)}</p>
              {str(item.text) ? (
                <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{str(item.text)}</p>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      {str(content.buttonUrl) ? (
        <AccentButton href={str(content.buttonUrl)}>
          {str(content.buttonLabel, 'Learn more')} <ExternalLink className="size-4" />
        </AccentButton>
      ) : null}
    </LandingShell>
  );
}

function ProductView({ content }: LandingProps) {
  const images = fileList(content.images);
  const specs = rows(content.specs);
  const [active, setActive] = React.useState(0);

  return (
    <LandingShell accent={content.accentColor} width="wide">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          {images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[Math.min(active, images.length - 1)].url}
                alt={str(content.name)}
                className="aspect-square w-full rounded-2xl border border-border object-cover"
              />
              {images.length > 1 ? (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => setActive(index)}
                      className={cn(
                        'size-14 shrink-0 overflow-hidden rounded-lg border',
                        index === active ? 'border-primary' : 'border-border opacity-70',
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted text-[13px] text-muted-foreground">
              No images yet
            </div>
          )}
        </div>

        <div>
          {str(content.brand) ? (
            <p className="text-[12.5px] font-medium uppercase tracking-wide text-muted-foreground">
              {str(content.brand)}
            </p>
          ) : null}
          <h1 className="mt-1 font-display text-[23px] font-bold leading-tight tracking-[-0.02em]">
            {str(content.name, 'Product')}
          </h1>
          {str(content.price) ? (
            <p className="mt-2 text-[20px] font-semibold" style={{ color: 'var(--landing-accent)' }}>
              {str(content.price)}
            </p>
          ) : null}
          {str(content.description) ? (
            <p className="mt-3 whitespace-pre-line text-[13.5px] leading-6 text-muted-foreground">
              {str(content.description)}
            </p>
          ) : null}

          {str(content.buyUrl) ? (
            <div className="mt-5">
              <AccentButton href={str(content.buyUrl)}>
                Buy now <ExternalLink className="size-4" />
              </AccentButton>
            </div>
          ) : null}

          {specs.length > 0 ? (
            <Card className="mt-5">
              <h2 className="mb-2 text-[13.5px] font-semibold">Specifications</h2>
              <dl className="divide-y divide-border">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-[13px] text-muted-foreground">{str(spec.key)}</dt>
                    <dd className="text-right text-[13px] font-medium">{str(spec.value)}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}
        </div>
      </div>
    </LandingShell>
  );
}

function EventView({ content, qrId }: LandingProps) {
  const agenda = rows(content.agenda);
  const cover = fileUrl(content.cover);
  const start = formatDateTime(content.start);

  return (
    <LandingShell accent={content.accentColor} width="wide">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="mb-5 h-44 w-full rounded-2xl border border-border object-cover" />
      ) : null}

      <LandingHeader title={str(content.title, 'Event')} subtitle={start} />

      <div className="space-y-2">
        {str(content.venue) || str(content.address) ? (
          <LinkRow
            href={
              str(content.mapsUrl) ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${str(content.venue)} ${str(content.address)}`.trim(),
              )}`
            }
            label={str(content.venue, 'Location')}
            detail={str(content.address) || undefined}
            icon={<MapPin />}
          />
        ) : null}
      </div>

      {str(content.description) ? (
        <Card className="mt-4">
          <p className="whitespace-pre-line text-[13.5px] leading-6 text-muted-foreground">{str(content.description)}</p>
        </Card>
      ) : null}

      {agenda.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-3 text-[14px] font-semibold">Agenda</h2>
          <ul className="space-y-2.5">
            {agenda.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="w-16 shrink-0 text-[12.5px] font-medium text-muted-foreground">{str(item.time)}</span>
                <span className="text-[13.5px]">{str(item.title)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="mt-5 space-y-2.5">
        <AccentButton href={`/api/landing/${qrId}/ics`} download>
          <CalendarPlus className="size-4" /> Add to calendar
        </AccentButton>
        {str(content.ticketUrl) ? (
          <a
            href={str(content.ticketUrl)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-[14.5px] font-semibold transition-colors hover:bg-surface-muted"
          >
            <Ticket className="size-4" /> Tickets and RSVP
          </a>
        ) : null}
      </div>
    </LandingShell>
  );
}

interface MenuItem {
  name: string;
  price?: string;
  description?: string;
}

/** Menu items are written one per line as "Name | Price | Description". */
function parseMenuItems(raw: string): MenuItem[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, price, description] = line.split('|').map((part) => part.trim());
      return { name: name ?? line, price: price || undefined, description: description || undefined };
    });
}

function MenuView({ content }: LandingProps) {
  const sections = rows(content.sections);
  const currency = str(content.currency, '');

  return (
    <LandingShell accent={content.accentColor} width="wide">
      <LandingHeader title={str(content.name, 'Menu')} logoUrl={fileUrl(content.logo)} />
      {str(content.note) ? (
        <p className="mb-5 rounded-xl border border-border bg-surface-muted/60 px-4 py-3 text-center text-[13px] leading-6 text-muted-foreground">
          {str(content.note)}
        </p>
      ) : null}

      <div className="space-y-5">
        {sections.map((section, index) => {
          const items = parseMenuItems(str(section.items));
          return (
            <section key={index}>
              <h2
                className="mb-2 border-b pb-1.5 font-display text-[16px] font-bold tracking-[-0.01em]"
                style={{ borderColor: 'var(--landing-accent)' }}
              >
                {str(section.name, `Section ${index + 1}`)}
              </h2>
              <ul className="divide-y divide-border">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start justify-between gap-4 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium">{item.name}</span>
                      {item.description ? (
                        <span className="block text-[12.5px] leading-5 text-muted-foreground">{item.description}</span>
                      ) : null}
                    </span>
                    {item.price ? (
                      <span className="shrink-0 text-[14px] font-semibold tabular-nums">
                        {currency ? `${currency} ` : ''}
                        {item.price}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </LandingShell>
  );
}

function FeedbackView({ content, qrId }: LandingProps) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const askEmail = content.askEmail === true;
  const positiveRedirect = str(content.positiveRedirectUrl);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) {
      toast.error('Choose a rating first');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/landing/${qrId}/feedback`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment || undefined, email: email || undefined }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(payload.error ?? 'Could not send your feedback');
        return;
      }
      setSent(true);
      if (rating >= 4 && positiveRedirect) {
        window.setTimeout(() => window.location.assign(positiveRedirect), 1200);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <LandingShell accent={content.accentColor}>
      <Card className="text-center">
        {fileUrl(content.logo) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fileUrl(content.logo) as string} alt="" className="mx-auto mb-4 h-14 rounded-xl object-contain" />
        ) : null}
        {str(content.business) ? (
          <p className="text-[12.5px] font-medium uppercase tracking-wide text-muted-foreground">
            {str(content.business)}
          </p>
        ) : null}

        {sent ? (
          <div className="py-6">
            <span
              className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-white"
              style={{ background: 'var(--landing-accent)' }}
            >
              <Star className="size-6" />
            </span>
            <h1 className="font-display text-[19px] font-semibold">Thank you</h1>
            <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
              {str(content.thanksMessage, 'Thank you — your feedback helps us improve.')}
            </p>
            {rating >= 4 && positiveRedirect ? (
              <p className="mt-3 text-[12.5px] text-muted-foreground">Taking you to our review page…</p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <h1 className="font-display text-[19px] font-semibold tracking-[-0.01em]">
              {str(content.title, 'How was your experience?')}
            </h1>

            <div className="flex justify-center gap-1.5" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  onClick={() => setRating(value)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn('size-8', value <= rating ? 'fill-current' : 'text-muted-foreground/40')}
                    style={value <= rating ? { color: 'var(--landing-accent)' } : undefined}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Tell us more (optional)"
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-input bg-surface p-3 text-[14px] leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            {askEmail ? (
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email (optional)"
                className="w-full rounded-xl border border-input bg-surface px-3 py-2.5 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : null}

            <AccentButton type="submit" onClick={undefined}>
              {loading ? 'Sending…' : 'Send feedback'}
            </AccentButton>
          </form>
        )}
      </Card>
    </LandingShell>
  );
}

function PlaylistView({ content }: LandingProps) {
  const tracks = rows(content.tracks);
  return (
    <LandingShell accent={content.accentColor} width="wide">
      <LandingHeader
        title={str(content.title, 'Playlist')}
        subtitle={str(content.description) || null}
        logoUrl={fileUrl(content.cover)}
      />
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {tracks.map((track, index) => {
          const url = str(track.url);
          const inner = (
            <>
              <span className="w-6 shrink-0 text-right text-[12.5px] tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{str(track.title, 'Untitled')}</span>
                {str(track.artist) ? (
                  <span className="block truncate text-[12.5px] text-muted-foreground">{str(track.artist)}</span>
                ) : null}
              </span>
              {url ? <Play className="size-4 shrink-0 text-muted-foreground" /> : null}
            </>
          );
          return (
            <li key={index}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                >
                  {inner}
                </a>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </LandingShell>
  );
}

// -------------------------------------------------------------------- dispatch

const VIEWS: Record<string, (props: LandingProps) => React.ReactElement> = {
  PDF: PdfView,
  IMAGE_GALLERY: GalleryView,
  VCARD_PLUS: VCardPlusView,
  VIDEO: VideoView,
  LINK_LIST: LinkListView,
  SOCIAL: SocialView,
  AUDIO: AudioView,
  BUSINESS: BusinessView,
  COUPON: CouponView,
  APP_STORE: AppStoreView,
  LANDING_PAGE: LandingPageView,
  PRODUCT: ProductView,
  EVENT_PAGE: EventView,
  MENU: MenuView,
  FEEDBACK: FeedbackView,
  PLAYLIST: PlaylistView,
};

export function LandingView(props: LandingProps) {
  const View = VIEWS[props.type];
  if (!View) {
    return (
      <LandingShell>
        <Card>
          <p className="text-center text-[13.5px] text-muted-foreground">
            This QR code type does not have a page to show.
          </p>
        </Card>
      </LandingShell>
    );
  }
  return <View {...props} />;
}
