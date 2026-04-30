import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";
import { ShopBundlesSection } from "./-components/ShopBundlesSection";
import { ShopContactCard } from "./-components/ShopContactCard";
import { ShopHeroGallery } from "./-components/ShopHeroGallery";
import { ShopInfoPanel } from "./-components/ShopInfoPanel";
import { ShopMapEmbed } from "./-components/ShopMapEmbed";
import { ShopProductsSection } from "./-components/ShopProductsSection";

export const Route = createFileRoute("/shops/$id")({
  component: ShopDetailPage,
});

function ShopDetailPage() {
  const { id } = Route.useParams();
  const { data: shop, isLoading, isError, refetch } = useGetShopsById(id);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
          <div className="h-8 w-40 animate-pulse rounded-md bg-secondary/20" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 h-72 animate-pulse rounded-2xl bg-secondary/20 lg:h-96" />
            <div className="h-64 animate-pulse rounded-2xl bg-secondary/20" />
          </div>
          <div className="space-y-6">
            <div className="h-24 w-full animate-pulse rounded-2xl bg-secondary/20" />
            <div className="h-64 w-full animate-pulse rounded-2xl bg-secondary/20" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !shop) {
    return (
      <PublicLayout>
        <div className="container mx-auto flex flex-col items-center py-24 text-center">
          <p className="font-bold text-destructive">Failed to load shop details.</p>
          <Button onClick={() => refetch()} variant="link">
            Retry
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
        <Link
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          to="/shops"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all shops
        </Link>

        {/* Photos left, contact card right. On mobile: photos then card stacked. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <ShopHeroGallery shopName={shop.name} />
          </div>
          <div>
            <ShopContactCard shopId={shop.id} />
            <Card className="mt-6 rounded-2xl p-6 border-none bg-secondary/10 shadow-none">
              <h3 className="font-heading text-xl font-bold mb-0">About our shop</h3>
              <div className="space-y-0 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground mb-0 uppercase tracking-wider text-[10px]">
                    {shop.description || "No description available."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Rest of page content */}
        <div className="space-y-8">
          <ShopInfoPanel address={shop.address} name={shop.name} />
          <Separator />
          <ShopMapEmbed address={shop.address} />
          <Separator />
          <ShopProductsSection shopId={shop.id} />
          <ShopBundlesSection shopId={shop.id} />
          <Separator />
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold">Reviews</h2>
            <p className="text-muted-foreground text-sm italic">
              Coming soon — we're working on bringing customer reviews to shop profiles!
              {/* TODO: wire up when backend ships GET /shops/:id/reviews */}
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
