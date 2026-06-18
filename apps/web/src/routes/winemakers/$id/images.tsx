import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeleteWinemakersByIdImagesByImageId } from "@/generated/hooks/useDeleteWinemakersByIdImagesByImageId";
import {
  getWinemakersByIdImagesQueryKey,
  useGetWinemakersByIdImages,
} from "@/generated/hooks/useGetWinemakersByIdImages";
import { EntityImagesManager } from "@/routes/-components/EntityImagesManager";

export const Route = createFileRoute("/winemakers/$id/images")({
  component: WinemakerImagesPage,
});

function WinemakerImagesPage() {
  const { id } = Route.useParams();
  const query = useGetWinemakersByIdImages(id);
  const deleteMutation = useDeleteWinemakersByIdImagesByImageId();

  return (
    <EntityImagesManager
      backLink={
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          params={{ id }}
          to="/winemakers/$id/edit"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
          Back to winemaker
        </Link>
      }
      data={query.data}
      deletingImageId={deleteMutation.variables?.imageId}
      description="Upload photos of your winery. PNG, JPEG, WebP, or AVIF up to 10 MB."
      doneHref={`/winemakers/${id}/edit`}
      isDeleting={deleteMutation.isPending}
      isError={query.isError}
      isLoading={query.isLoading}
      loadErrorMessage="Could not load images for this winemaker."
      onDelete={(imageId, options) => deleteMutation.mutate({ id, imageId }, options)}
      onRetry={() => query.refetch()}
      queryKey={getWinemakersByIdImagesQueryKey(id)}
      title="Winemaker images"
      uploadUrl={`/winemakers/${id}/images`}
    />
  );
}
