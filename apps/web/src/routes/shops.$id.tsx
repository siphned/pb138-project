import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { ShowOwner } from "@/components/primitives/show-owner";
import { ShopHero } from "@/components/shops/ShopHero";
import { ShopManageMenu } from "@/components/shops/ShopManageMenu";
import { ShopProductsRow } from "@/components/shops/ShopProductsRow";
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
    <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
        to="/shops"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shops
      </Link>

      <ShopHero shop={shop} />

      <div className="overflow-hidden rounded-xl">
        <ShopMapEmbed address={shop.address} />
      </div>

      <div className="space-y-16">
        <ShopProductsRow isBundle={false} shopId={id} />
        <ShopProductsRow isBundle={true} shopId={id} />

        <Section heading="Reviews">
          <EmptyState
            description="We're working on bringing customer reviews to shop profiles."
            title="Reviews coming soon"
          />
        </Section>

        <ShowOwner ownerUserId={shop.ownerUserId}>
          <Section heading="Owner Actions">
            <ShopManageMenu shop={shop} />
          </Section>
        </ShowOwner>
      </div>
    </div>
  );
}
