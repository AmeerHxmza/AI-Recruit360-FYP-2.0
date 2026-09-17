import { Skeleton } from "@/components/ui/skeleton";

export default function EvaluationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="space-y-4 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
