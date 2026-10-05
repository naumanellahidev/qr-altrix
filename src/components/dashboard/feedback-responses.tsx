import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/page-header';

export interface FeedbackItem {
  id: string;
  at: string;
  rating: number;
  comment: string | null;
  email: string | null;
  country: string | null;
}

/**
 * Responses to a Feedback form code: average rating, distribution, and the latest
 * comments. Server-rendered; dates are formatted in the owner's time zone.
 */
export function FeedbackResponses({ items, total, timeZone }: { items: FeedbackItem[]; total: number; timeZone: string }) {
  const rated = items.filter((item) => item.rating >= 1 && item.rating <= 5);
  const average = rated.length ? rated.reduce((sum, item) => sum + item.rating, 0) / rated.length : 0;
  const counts = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: rated.filter((item) => item.rating === stars).length }));
  const format = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone });
    } catch {
      return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
    }
  };

  return (
    <Card className="mt-5 p-5">
      <SectionHeader
        title="Feedback responses"
        description={
          total === 0
            ? 'Nothing yet. Responses from this form appear here as soon as someone submits one.'
            : `${total} response${total === 1 ? '' : 's'}${total > items.length ? ` · latest ${items.length} shown` : ''}. Also delivered to webhooks subscribed to feedback.received.`
        }
      />
      {total > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <p className="text-[34px] font-bold leading-none tabular-nums">{average.toFixed(1)}</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">average of {rated.length} rating{rated.length === 1 ? '' : 's'}</p>
            <ul className="mt-4 space-y-1.5">
              {counts.map(({ stars, count }) => (
                <li key={stars} className="flex items-center gap-2 text-[12.5px]">
                  <span className="w-8 tabular-nums text-muted-foreground">{stars} ★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className="block h-full rounded-full bg-warning"
                      style={{ width: `${rated.length ? (count / rated.length) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="w-8 text-end tabular-nums text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                  <span className="font-semibold text-warning" aria-label={`${item.rating} out of 5`}>
                    {'★'.repeat(item.rating)}
                    <span className="text-muted-foreground/40">{'★'.repeat(Math.max(0, 5 - item.rating))}</span>
                  </span>
                  <span>{format(item.at)}</span>
                  {item.country ? <span>{item.country}</span> : null}
                  {item.email ? <span className="break-all text-foreground">{item.email}</span> : null}
                </div>
                {item.comment ? <p className="mt-1.5 whitespace-pre-line text-[14px] leading-6">{item.comment}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
