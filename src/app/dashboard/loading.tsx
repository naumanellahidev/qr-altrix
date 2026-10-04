import { CardSkeleton, Skeleton } from '@/components/ui/feedback';

/** Matches the overview layout so the page does not jump when data arrives. */
export default function DashboardLoading() {
  return (
    <div className="animate-in-up">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[106px] rounded-2xl" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-[320px] rounded-2xl" />
        <div className="space-y-5">
          <Skeleton className="h-[180px] rounded-2xl" />
          <Skeleton className="h-[120px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
