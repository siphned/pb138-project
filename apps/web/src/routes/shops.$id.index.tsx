import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { ShopDetailsCard } from "@/components/shops/ShopDetailsCard";
import { ShopHero } from "@/components/shops/ShopHero";
import { ShopProductsRow } from "@/components/shops/ShopProductsRow";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";
import { ShopHeroGallery } from "./-components/ShopHeroGallery";
import { ShopMapEmbed } from "./-components/ShopMapEmbed";

export const Route = createFileRoute("/shops/$id/")({
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
    <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
        to="/shops"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shops
      </Link>

      <ShopHero shop={shop} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-muted shadow-lg">
          <ShopHeroGallery shopName={shop.name} />
        </div>

        <ShopDetailsCard shop={shop} />
      </div>

      <Section heading="Location">
        <div className="overflow-hidden rounded-3xl border border-border shadow-md">
          <ShopMapEmbed address={shop.address} />
        </div>
      </Section>

      <div className="space-y-16">
        <ShopProductsRow isBundle={false} shopId={id} />
        <ShopProductsRow isBundle={true} shopId={id} />

        <Section heading="Customer Reviews">
          <p className="text-sm italic text-muted-foreground">
            Coming soon — we're working on bringing customer reviews to shop profiles!
          </p>
        </Section>
      </div>
    </div>
  );
}
