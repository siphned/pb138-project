import { PublicLayout } from "@/components/layout/PublicLayout";

export function ProductPageSkeleton() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
        <div className="h-6 w-32 animate-pulse rounded-md bg-secondary/20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-secondary/20" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 animate-pulse rounded-md bg-secondary/20" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-secondary/20" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-secondary/20" />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
