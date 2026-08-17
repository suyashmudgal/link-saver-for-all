import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const PageHeaderSkeleton = () => (
  <div className="mb-8 space-y-3">
    <Skeleton className="h-3 w-28" />
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-4 w-40" />
  </div>
);

export const CardGridSkeleton = ({ count = 8, columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" }:
  { count?: number; columns?: string }) => (
  <div className={`grid gap-4 ${columns}`}>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="overflow-hidden border-border/40">
        <Skeleton className="h-36 w-full rounded-none" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const StatTilesSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-5 border-border/40 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-16" />
      </Card>
    ))}
  </div>
);

export const ChartSkeleton = ({ height = 260 }: { height?: number }) => (
  <Card className="p-6 border-border/40 space-y-4">
    <Skeleton className="h-4 w-40" />
    <Skeleton className="w-full rounded-xl" style={{ height }} />
  </Card>
);

export const ListRowsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-5 border-border/40 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </Card>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 2 }).map((_, i) => (
      <Card key={i} className="p-6 border-border/40 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </Card>
    ))}
  </div>
);
