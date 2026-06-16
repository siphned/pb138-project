import { cva, type VariantProps } from "class-variance-authority";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const loadingStateVariants = cva("animate-in fade-in duration-200", {
  defaultVariants: { variant: "detail" },
  variants: {
    variant: {
      catalog: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
      detail: "space-y-6",
      "detail-media": "space-y-8",
      form: "space-y-4",
      list: "space-y-3",
    },
  },
});

type LoadingStateProps = React.ComponentProps<"div"> & VariantProps<typeof loadingStateVariants>;

export function LoadingState({ className, variant = "detail", ...props }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(loadingStateVariants({ variant }), className)}
      data-slot="loading-state"
      {...props}
    >
      {variant === "detail" && (
        <>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </>
      )}
      {variant === "detail-media" && (
        <>
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </>
      )}
      {variant === "list" && (
        <>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </>
      )}
      {variant === "catalog" && (
        <>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="hidden aspect-[4/5] w-full lg:block" />
          <Skeleton className="hidden aspect-[4/5] w-full lg:block" />
          <Skeleton className="hidden aspect-[4/5] w-full lg:block" />
        </>
      )}
      {variant === "form" && (
        <>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
        </>
      )}
    </div>
  );
}

export { loadingStateVariants };
