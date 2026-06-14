import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Separator } from "@/components/ui/separator";
import { useGetWinesById } from "@/generated/hooks/useGetWinesById";
import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import { WineDetailsCard } from "@/routes/wines/-components/WineDetailsCard";
import { WineGallery } from "@/routes/wines/-components/WineGallery";
import { WinesAvailableInShops } from "@/routes/wines/-components/WinesAvailableInShops";

export const Route = createFileRoute("/wines/$id")({
  component: WineDetailPage,
});

function WineDetailPage() {
  const { id } = Route.useParams();
  const { data: wine, isLoading, isError, refetch } = useGetWinesById(id);
  const { data: wineImages } = useGetWinesByIdImages(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !wine) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const subtitle = wine.winemaker?.name
    ? `${wine.winemaker.name} · ${wine.vintageYear}`
    : String(wine.vintageYear);

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/wines"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        All wines
      </Link>

      <PageHeader description={subtitle} title={wine.name} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-muted shadow-lg">
          <WineGallery images={wineImages?.map((img) => img.url)} wineName={wine.name} />
        </div>

        <WineDetailsCard wine={wine} />
      </div>

      <Separator />

      <WinesAvailableInShops wineId={id} />
    </div>
  );
}
