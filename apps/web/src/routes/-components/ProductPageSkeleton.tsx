import { Skeleton } from "@/components/ui/skeleton";

export function ProductPageSkeleton() {
  return (
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
        <Skeleton className="h-6 w-32 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4 rounded-md" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
  );
}
