import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/lib/seo/faq';

/**
 * Homepage FAQ. Native <details> elements: the answers are in the HTML that search
 * engines and AI crawlers read (a script-driven accordion leaves closed answers out of
 * the page entirely), it works without JavaScript, and keyboard and screen-reader
 * support comes from the browser. The same items feed the FAQPage structured data.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-border bg-surface py-16 sm:py-24">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">
            Questions, answered plainly
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-7 text-muted-foreground">
            If something here is still unclear, the support page will reach a human.
          </p>
        </div>

        <div className="w-full divide-y divide-border border-y border-border">
          {items.map((faq, index) => (
            <details key={faq.q} className="group" open={index === 0}>
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <h3 className="font-medium">{faq.q}</h3>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 pr-8 text-[14px] leading-7 text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
