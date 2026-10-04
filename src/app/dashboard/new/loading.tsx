import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/feedback';

export default function NewQrLoading() {
  return (
    <div className="animate-in-up">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_352px]">
        <div className="space-y-5">
          <div className="flex gap-1.5 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-[7.5rem] shrink-0" />
            ))}
          </div>
          <Card className="space-y-4 p-5">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[86px] rounded-xl" />
              ))}
            </div>
          </Card>
        </div>

        <Card className="space-y-4 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </Card>
      </div>
    </div>
  );
}
