import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopDetailsCard } from "@/components/shops/ShopDetailsCard";
import { ShopHero } from "@/components/shops/ShopHero";
import { ShopProductsGrid } from "@/components/shops/ShopProductsGrid";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";
import { ShopMapEmbed } from "./-components/ShopMapEmbed";

export const Route = createFileRoute("/shops/$id")({
  component: ShopDetailPage,
});

function ShopDetailPage() {
  const { id } = Route.useParams();
  const { data: shop, isLoading, isError, refetch } = useGetShopsById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="We couldn't find the shop you're looking for."
          onRetry={() => refetch()}
          title="Shop not found"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-10 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
        to="/shops"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Shops
      </Link>

      <ShopHero shop={shop} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          <ShopDetailsCard shop={shop} />
          
          <Section heading="Products">
            <ShopProductsGrid shopId={id} />
          </Section>
          
          <Section heading="Wine Bundles">
            <ShopProductsGrid isBundle shopId={id} />
          </Section>

          <Section heading="Reviews">
            <p className="text-sm italic text-muted-foreground">
              Coming soon — we're working on bringing customer reviews to shop profiles!
            </p>
          </Section>
        </div>

        <aside className="space-y-8">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <ShopMapEmbed address={shop.address} />
          </div>
          {/* Potential right-rail content like 'Top Rated Wines from this shop' could go here */}
        </aside>
      </div>
    </div>
  );
}
