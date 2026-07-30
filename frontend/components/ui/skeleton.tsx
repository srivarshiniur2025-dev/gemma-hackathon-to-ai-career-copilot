import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-background-secondary", className)}
      aria-hidden
    />
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex h-[280px] flex-col justify-end gap-3 p-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-[220px] w-full rounded-2xl" />
    </div>
  );
}

export function CanvasSkeleton() {
  return <Skeleton className="absolute inset-0 -z-10 h-full w-full opacity-40" />;
}

export function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-32 w-48 rounded-[24px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-[24px]" />
        <Skeleton className="h-80 rounded-[24px]" />
      </div>
    </div>
  );
}
