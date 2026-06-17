import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeleteEventsByIdImagesByImageId } from "@/generated/hooks/useDeleteEventsByIdImagesByImageId";
import {
  getEventsByIdImagesQueryKey,
  useGetEventsByIdImages,
} from "@/generated/hooks/useGetEventsByIdImages";
import { EntityImagesManager } from "@/routes/-components/EntityImagesManager";

export const Route = createFileRoute("/events/$id/images")({
  component: EventImagesPage,
});

function EventImagesPage() {
  const { id } = Route.useParams();
  const query = useGetEventsByIdImages(id);
  const deleteMutation = useDeleteEventsByIdImagesByImageId();

  return (
    <EntityImagesManager
      backLink={
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          params={{ id }}
          to="/events/$id/edit"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
          Back to event
        </Link>
      }
      data={query.data}
      deletingImageId={deleteMutation.variables?.imageId}
      description="Upload photos for this event. PNG, JPEG, WebP, or AVIF up to 10 MB."
      doneHref={`/events/${id}/edit`}
      isDeleting={deleteMutation.isPending}
      isError={query.isError}
      isLoading={query.isLoading}
      loadErrorMessage="Could not load images for this event."
      onDelete={(imageId, options) => deleteMutation.mutate({ id, imageId }, options)}
      onRetry={() => query.refetch()}
      queryKey={getEventsByIdImagesQueryKey(id)}
      title="Event images"
      uploadUrl={`/events/${id}/images`}
    />
  );
}
