import { CardSkeleton, Skeleton } from '@/components/ui/feedback';

export default function StatsLoading() {
  return (
    <div className="animate-in-up">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-[11rem]" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <Skeleton className="mt-5 h-[360px] rounded-2xl" />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-2xl" />
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
    </div>
  );
}
