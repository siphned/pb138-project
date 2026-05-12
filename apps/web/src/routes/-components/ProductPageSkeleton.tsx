import { LoadingState } from "@/components/primitives/loading-state";

export function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8 lg:px-12">
      <LoadingState variant="detail" />
    </div>
  );
}
