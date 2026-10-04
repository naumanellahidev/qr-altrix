import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface LegalSection {
  heading: string;
  body: string[];
}

/** Shared layout for the terms and privacy pages: one readable column, generous rhythm. */
export function LegalDocument({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <article className="container max-w-3xl py-12">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to QR ALTRIX
      </Link>

      <header className="mb-8">
        <Badge variant="outline" className="mb-3">
          Last updated {updated}
        </Badge>
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em] sm:text-[36px]">{title}</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted-foreground">{intro}</p>
      </header>

      <nav className="mb-10 rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">Contents</p>
        <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.heading}>
              <a
                href={`#section-${index}`}
                className="text-[13px] text-muted-foreground transition-colors hover:text-primary"
              >
                {index + 1}. {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-9">
        {sections.map((section, index) => (
          <section key={section.heading} id={`section-${index}`} className="scroll-mt-24">
            <h2 className="mb-3 font-display text-[19px] font-semibold tracking-[-0.015em]">
              {index + 1}. {section.heading}
            </h2>
            <div className="space-y-3">
              {section.body.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="text-[14.5px] leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-border pt-6 text-[12.5px] leading-6 text-muted-foreground">
        This document is written for a self-hosted install and is not legal advice. The operator of this server should
        review it against the law that applies to them before relying on it.
      </p>
    </article>
  );
}
