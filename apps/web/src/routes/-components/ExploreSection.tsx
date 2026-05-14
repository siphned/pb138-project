import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { BundleCard } from "@/components/catalog/BundleCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { buttonVariants } from "@/components/ui/button";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

interface ExploreSectionProps {
  mode: "wines" | "bundles";
}

export function ExploreSection({ mode }: ExploreSectionProps) {
  const { data: rawData, isLoading } = useGetProducts();
  const products = (rawData?.data ?? [])
    .filter((p) => (mode === "bundles" ? p.isBundle : !p.isBundle))
    .slice(0, 8);

  const title = mode === "bundles" ? "Featured Bundles" : "Featured Wines";
  const linkTo = mode === "bundles" ? "/bundles" : "/wines";
  const linkLabel = mode === "bundles" ? "See all bundles" : "See all wines";

  if (isLoading) {
    return (
      <section aria-label={title} className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">{title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              className="h-[300px] w-[200px] shrink-0 animate-pulse rounded-2xl bg-secondary/20"
              key={i}
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section aria-label={title} className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">{title}</h2>
        <p className="italic text-muted-foreground text-sm">
          No {mode} available to feature right now.
        </p>
      </section>
    );
  }

  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">{title}</h2>
        <Link
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          search={{ page: 1, sort: "newest" }}
          to={linkTo as any}
        >
          {linkLabel} <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight02Icon} />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) =>
          mode === "bundles" ? (
            <div className="w-70 shrink-0" key={product.id}>
              <BundleCard product={product as any} />
            </div>
          ) : (
            <div className="w-70 shrink-0" key={product.id}>
              <ProductCard product={product as any} />
            </div>
          )
        )}
      </div>
    </section>
  );
}
