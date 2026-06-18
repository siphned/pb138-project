import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Separator } from "@/components/ui/separator";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { getWinesByIdQueryOptions, useGetWinesById } from "@/generated/hooks/useGetWinesById";
import {
  getWinesByIdImagesQueryOptions,
  useGetWinesByIdImages,
} from "@/generated/hooks/useGetWinesByIdImages";
import { useRoles } from "@/hooks/useRoles";
import { getQueryClient } from "@/lib/query-client";
import { WineRowMenu } from "@/routes/-components/WineRowMenu";
import { WineDetailsCard } from "@/routes/wines/-components/WineDetailsCard";
import { WineGallery } from "@/routes/wines/-components/WineGallery";
import { WinesAvailableInShops } from "@/routes/wines/-components/WinesAvailableInShops";

export const Route = createFileRoute("/wines/$id/")({
  beforeLoad: async ({ params }) => {
    const queryClient = getQueryClient();
    // Prefetch wine and images data to avoid loading state
    await Promise.all([
      queryClient.prefetchQuery(getWinesByIdQueryOptions(params.id)),
      queryClient.prefetchQuery(getWinesByIdImagesQueryOptions(params.id)),
    ]).catch(() => {
      // Silently fail - component will handle loading state if prefetch fails
    });
  },
  component: WineDetailPage,
});

function WineDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const roles = useRoles();
  const { data: wine, isLoading, isError, refetch } = useGetWinesById(id);
  const { data: wineImages, isLoading: imagesLoading } = useGetWinesByIdImages(id);
  const { data: myWinemaker } = useGetWinemakersMe({
    query: { enabled: roles.includes("winemaker") },
  });

  if (isLoading || imagesLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail-media" />
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

  const canManage =
    roles.includes("admin") || (!!myWinemaker?.id && myWinemaker.id === wine.winemaker?.id);

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/wines"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        All wines
      </Link>

      <div className="flex items-start justify-between gap-4">
        <PageHeader description={subtitle} title={wine.name} />
        {canManage && (
          <WineRowMenu
            onDeleted={() => navigate({ to: "/wines" })}
            wineId={wine.id}
            wineName={wine.name}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <WineGallery images={wineImages?.map((img) => img.url)} wineName={wine.name} />
        </div>

        <WineDetailsCard wine={wine} />
      </div>

      <Separator />

      <WinesAvailableInShops wineId={id} />
    </div>
  );
}
