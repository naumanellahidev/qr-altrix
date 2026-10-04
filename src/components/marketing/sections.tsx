import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QR_TYPES } from '@/lib/qr/catalog';
import { MaskIcon } from '@/components/ui/mask-icon';

export function TrustBar({ expiryEnabled = false }: { expiryEnabled?: boolean }) {
  const items = [
    // The claim has to match what the operator has actually configured.
    expiryEnabled
      ? { icon: 'CalendarClock', label: 'Clear expiry dates' }
      : { icon: 'Infinity', label: 'No expiry, ever' },
    { icon: 'ShieldCheck', label: 'Privacy-first analytics' },
    { icon: 'Globe2', label: 'Your own domain' },
    { icon: 'Boxes', label: 'Unlimited codes' },
    { icon: 'Code2', label: 'Full REST API' },
  ];
  return (
    <div className="border-y border-border bg-surface">
      <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
            <MaskIcon name={item.icon} className="size-3.5 text-primary" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: 'Palette',
    title: 'A design editor that earns the print budget',
    body: '32 frame presets, seven pattern styles, gradients, logo library and a live scan-safety score. What you see in the preview is exactly the file you download.',
  },
  {
    icon: 'Infinity',
    title: 'Dynamic codes that never expire',
    body: 'No trial countdown, no subscription wall, no scan cap. A code stops only when you pause it, delete it, or set a schedule yourself.',
  },
  {
    icon: 'BarChart3',
    title: 'Analytics you can act on',
    body: 'Total and unique scans, country, city, device, browser, OS, language, time of day, referrer and UTM campaigns — exportable to CSV or XLSX.',
  },
  {
    icon: 'Globe2',
    title: 'Your domain, your links',
    body: 'Point links.yourbrand.com at QR ALTRIX, verify it with one DNS record, and pick your own slug per code. Free, like everything else here.',
  },
  {
    icon: 'Layers',
    title: 'Bulk generation without limits',
    body: 'Upload a CSV, map the columns, validate every row before anything is written, then download the whole batch as a ZIP.',
  },
  {
    icon: 'Users',
    title: 'Team roles and audit trail',
    body: 'Owner, Admin, Editor, Analyst, Viewer and folder-scoped Limited access — with a security history of every change.',
  },
  {
    icon: 'Lock',
    title: 'Password and schedule controls',
    body: 'Protect a code with a password, open it only during opening hours, or cap scans — all optional, all switched off by default.',
  },
  {
    icon: 'Smartphone',
    title: 'Smart routing',
    body: 'Send iPhone users to the App Store and Android users to Play, or route by country, language and time of day from one printed code.',
  },
  {
    icon: 'Code2',
    title: 'API and webhooks',
    body: 'Create, update and read codes over a documented REST API with scoped keys, then receive webhooks when codes are scanned.',
  },
];

export function Features() {
  return (
    <section id="features" className="cv-auto container scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">
          <MaskIcon name="Sparkles" className="size-3" /> Everything included
        </Badge>
        <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[36px]">
          A complete QR platform, not a paywalled generator
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
          QR ALTRIX gives you the design tools, tracking and infrastructure that usually sit behind a subscription — on
          your own server, under your own domain.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lifted">
            <span className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border bg-surface-muted text-primary-soft-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary-soft">
              <MaskIcon name={feature.icon} className="size-[18px]" />
            </span>
            <h3 className="text-[15px] font-semibold leading-snug">{feature.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">{feature.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

const USE_CASES = [
  {
    icon: 'UtensilsCrossed',
    title: 'Restaurants and cafés',
    body: 'Table-tent menus you edit from your phone. Change a price at 11 am and every printed code is already up to date.',
    tone: 'from-amber-500/15 to-orange-500/5',
  },
  {
    icon: 'Store',
    title: 'Retail and packaging',
    body: 'Product pages, how-to videos and coupons on the pack. Track which store, city and device scanned most.',
    tone: 'from-emerald-500/15 to-teal-500/5',
  },
  {
    icon: 'Building2',
    title: 'Real estate',
    body: 'Window cards and yard signs that open a photo gallery, floor plan PDF and your contact card in one tap.',
    tone: 'from-sky-500/15 to-indigo-500/5',
  },
  {
    icon: 'CalendarCheck',
    title: 'Events and venues',
    body: 'Tickets, agendas and feedback forms. Schedule a code to open only during the event, then point it at the recap.',
    tone: 'from-violet-500/15 to-fuchsia-500/5',
  },
  {
    icon: 'Rocket',
    title: 'Agencies and marketers',
    body: 'Campaign codes with UTM parameters baked in, folders per client, team roles, and CSV exports for reporting.',
    tone: 'from-rose-500/15 to-pink-500/5',
  },
  {
    icon: 'Images',
    title: 'Creators',
    body: 'One link-in-bio code on every poster, with your profiles, latest video and playlist behind it.',
    tone: 'from-cyan-500/15 to-blue-500/5',
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="cv-auto scroll-mt-24 border-y border-border bg-surface py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[36px]">
            Built for the places QR codes actually live
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            Print once, change the destination as often as you need.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <div
              key={useCase.title}
              className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${useCase.tone} p-5`}
            >
              <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-card text-foreground shadow-soft">
                <MaskIcon name={useCase.icon} className="size-[18px]" />
              </span>
              <h3 className="text-[15px] font-semibold">{useCase.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">{useCase.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TypesShowcase() {
  const statics = QR_TYPES.filter((type) => type.kind === 'STATIC');
  const dynamics = QR_TYPES.filter((type) => type.kind === 'DYNAMIC');

  return (
    <section id="types" className="cv-auto container scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[36px]">
          {QR_TYPES.length} QR code types
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
          Static codes hold their content forever and work offline. Dynamic codes point at a short link you own, so you
          can edit and measure them without reprinting.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          { title: 'Static', subtitle: 'Encoded directly in the pattern', items: statics, variant: 'outline' as const },
          { title: 'Dynamic', subtitle: 'Editable and tracked, never expiring', items: dynamics, variant: 'primary' as const },
        ].map((group) => (
          <Card key={group.title} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold">{group.title}</h3>
                <p className="text-[12.5px] text-muted-foreground">{group.subtitle}</p>
              </div>
              <Badge variant={group.variant}>{group.items.length} types</Badge>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {group.items.map((type) => (
                <li
                  key={type.type}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-surface-muted"
                >
                  <MaskIcon name={type.icon} className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{type.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="cv-auto container py-16 sm:py-20">
      <div className="qa-glow relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-card sm:px-12">
        <div className="relative z-10 mx-auto max-w-2xl">
          <Badge variant="success" className="mb-4">
            <MaskIcon name="Clock" className="size-3" /> Free forever — no trial clock
          </Badge>
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">
            Print it once. Change it whenever.
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            Create your first dynamic QR code in under a minute. It keeps working for as long as you want it to — that is
            a product rule here, not a plan feature.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="brand">
              <Link href="/signup">Create a free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/developers">Read the API docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
