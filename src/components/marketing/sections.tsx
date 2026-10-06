import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QR_TYPES } from '@/lib/qr/catalog';
import { MaskIcon } from '@/components/ui/mask-icon';
import { TYPE_SLUGS } from '@/content/registry';
import type { CatalogCopy, HomeCopy, TypeKey } from '@/content/schema';
import { localePath, type Locale } from '@/i18n/locales';

export function TrustBar({
  copy,
  expiryEnabled = false,
  showApi = false,
}: {
  copy: HomeCopy;
  expiryEnabled?: boolean;
  /** The API claim appears only while a platform admin has the developer API switched on. */
  showApi?: boolean;
}) {
  const items = [
    // The claim has to match what the operator has actually configured.
    expiryEnabled ? { icon: 'CalendarClock', label: copy.trust.clearExpiry } : { icon: 'Infinity', label: copy.trust.noExpiry },
    { icon: 'ShieldCheck', label: copy.trust.privacy },
    { icon: 'Globe2', label: copy.trust.domain },
    { icon: 'Boxes', label: copy.trust.unlimited },
    ...(showApi ? [{ icon: 'Code2', label: copy.trust.api }] : []),
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

/** Icons for HomeCopy.features, in order. */
const FEATURE_ICONS = ['Palette', 'Infinity', 'BarChart3', 'Globe2', 'Layers', 'Users', 'Lock', 'Smartphone', 'Code2'];
/** HomeCopy.features[API_FEATURE] is "API and webhooks" in every language. */
const API_FEATURE = FEATURE_ICONS.indexOf('Code2');

export function Features({ copy, showApi = false }: { copy: HomeCopy; showApi?: boolean }) {
  return (
    <section id="features" className="cv-auto container scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">
          <MaskIcon name="Sparkles" className="size-3" /> {copy.featuresBadge}
        </Badge>
        <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[36px]">{copy.featuresTitle}</h2>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{copy.featuresLead}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {copy.features.map((feature, index) => (showApi || index !== API_FEATURE) && (
          <Card key={feature.title} className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lifted">
            <span className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border bg-surface-muted text-primary-soft-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary-soft">
              <MaskIcon name={FEATURE_ICONS[index] ?? 'Sparkles'} className="size-[18px]" />
            </span>
            <h3 className="text-[15px] font-semibold leading-snug">{feature.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">{feature.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

/** Icon, tint and the use-case page for HomeCopy.useCases, in order. */
const AUDIENCES = [
  { icon: 'UtensilsCrossed', tone: 'from-amber-500/15 to-orange-500/5', href: '/use-cases/restaurant-menu' },
  { icon: 'Store', tone: 'from-emerald-500/15 to-teal-500/5', href: '/use-cases/product-packaging' },
  { icon: 'Building2', tone: 'from-sky-500/15 to-indigo-500/5', href: '/use-cases/real-estate' },
  { icon: 'CalendarCheck', tone: 'from-violet-500/15 to-fuchsia-500/5', href: '/use-cases/events-and-weddings' },
  { icon: 'Rocket', tone: 'from-rose-500/15 to-pink-500/5', href: '/use-cases' },
  { icon: 'Images', tone: 'from-cyan-500/15 to-blue-500/5', href: '/use-cases/social-media' },
];

export function UseCases({ copy, locale }: { copy: HomeCopy; locale: Locale }) {
  return (
    <section id="use-cases" className="cv-auto scroll-mt-24 border-y border-border bg-surface py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[36px]">{copy.useCasesTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{copy.useCasesLead}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.useCases.map((useCase, index) => {
            const audience = AUDIENCES[index] ?? AUDIENCES[0];
            return (
              <Link
                key={useCase.title}
                href={localePath(locale, audience.href)}
                className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${audience.tone} p-5 transition-colors hover:border-primary/40`}
              >
                <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-card text-foreground shadow-soft">
                  <MaskIcon name={audience.icon} className="size-[18px]" />
                </span>
                <h3 className="text-[15px] font-semibold">{useCase.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">{useCase.body}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TypesShowcase({
  copy,
  catalog,
  locale,
  staticLabel,
  dynamicLabel,
}: {
  copy: HomeCopy;
  catalog: CatalogCopy;
  locale: Locale;
  staticLabel: string;
  dynamicLabel: string;
}) {
  const statics = QR_TYPES.filter((type) => type.kind === 'STATIC');
  const dynamics = QR_TYPES.filter((type) => type.kind === 'DYNAMIC');

  return (
    <section id="types" className="cv-auto container scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[36px]">
          {copy.typesTitle.replace('{count}', String(QR_TYPES.length))}
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{copy.typesLead}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          { title: staticLabel, subtitle: copy.staticSubtitle, items: statics, variant: 'outline' as const },
          { title: dynamicLabel, subtitle: copy.dynamicSubtitle, items: dynamics, variant: 'primary' as const },
        ].map((group) => (
          <Card key={group.title} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold">{group.title}</h3>
                <p className="text-[12.5px] text-muted-foreground">{group.subtitle}</p>
              </div>
              <Badge variant={group.variant}>{copy.typesCount.replace('{count}', String(group.items.length))}</Badge>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {group.items.map((type) => (
                <li key={type.type}>
                  <Link
                    href={localePath(locale, `/qr-code-generator/${TYPE_SLUGS[type.type as TypeKey]}`)}
                    className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-[13px] transition-colors hover:bg-surface-muted"
                  >
                    <MaskIcon name={type.icon} className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{catalog[type.type as TypeKey]?.label ?? type.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function CtaBand({ copy, showApi = false }: { copy: HomeCopy; showApi?: boolean }) {
  return (
    <section className="cv-auto container py-16 sm:py-20">
      <div className="qa-glow relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-card sm:px-12">
        <div className="relative z-10 mx-auto max-w-2xl">
          <Badge variant="success" className="mb-4">
            <MaskIcon name="Clock" className="size-3" /> {copy.ctaBadge}
          </Badge>
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">{copy.ctaTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{copy.ctaBody}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="brand">
              <Link href="/signup">{copy.ctaSignup}</Link>
            </Button>
            {showApi ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/developers">{copy.ctaApi}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
