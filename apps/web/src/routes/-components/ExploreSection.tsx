import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BundleCard } from "@/components/catalog/BundleCard";
import { buttonVariants } from "@/components/ui/button";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import type { GetProducts200 } from "@/generated/types/GetProducts";
import { WineCard } from "./WineCard";

interface ExploreSectionProps {
  mode: "wines" | "bundles";
}

export function ExploreSection({ mode }: ExploreSectionProps) {
  const { data: rawData, isLoading } = useGetProducts();
  const allProducts = (
    Array.isArray(rawData)
      ? rawData
      : ((rawData as unknown as { data?: GetProducts200 })?.data ?? [])
  ) as GetProducts200;
  const products = allProducts
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
        <p className="text-sm text-muted-foreground italic">
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
          to={linkTo}
        >
          {linkLabel} <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) =>
          mode === "bundles" ? (
            <div className="w-70 shrink-0" key={product.id}>
              <BundleCard product={product} />
            </div>
          ) : (
            <div className="w-70 shrink-0" key={product.id}>
              <WineCard product={product} />
            </div>
          )
        )}
      </div>
    </section>
  );
}
