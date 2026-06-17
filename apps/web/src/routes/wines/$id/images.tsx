import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeleteWinesByIdImagesByImageId } from "@/generated/hooks/useDeleteWinesByIdImagesByImageId";
import {
  getWinesByIdImagesQueryKey,
  useGetWinesByIdImages,
} from "@/generated/hooks/useGetWinesByIdImages";
import { EntityImagesManager } from "@/routes/-components/EntityImagesManager";

export const Route = createFileRoute("/wines/$id/images")({
  component: WineImagesPage,
});

function WineImagesPage() {
  const { id } = Route.useParams();
  const query = useGetWinesByIdImages(id);
  const deleteMutation = useDeleteWinesByIdImagesByImageId();

  return (
    <EntityImagesManager
      backLink={
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          params={{ id }}
          to="/wines/$id/edit"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
          Back to wine
        </Link>
      }
      data={query.data}
      deletingImageId={deleteMutation.variables?.imageId}
      description="Upload photos of this wine. PNG, JPEG, WebP, or AVIF up to 10 MB."
      doneHref={`/wines/${id}/edit`}
      isDeleting={deleteMutation.isPending}
      isError={query.isError}
      isLoading={query.isLoading}
      loadErrorMessage="Could not load images for this wine."
      onDelete={(imageId, options) => deleteMutation.mutate({ id, imageId }, options)}
      onRetry={() => query.refetch()}
      queryKey={getWinesByIdImagesQueryKey(id)}
      title="Wine images"
      uploadUrl={`/wines/${id}/images`}
    />
  );
}
