import { Card } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/ui/feedback';

export default function CodesLoading() {
  return (
    <div className="animate-in-up">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Card className="space-y-2 p-3">
            <Skeleton className="h-9 w-full" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </Card>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <Skeleton className="h-10 w-full max-w-xs" />
            <Skeleton className="h-10 w-[11rem]" />
            <Skeleton className="h-10 w-[11rem]" />
          </div>
          <Card flush>
            <TableSkeleton rows={8} columns={6} />
          </Card>
        </div>
      </div>
    </div>
  );
}
