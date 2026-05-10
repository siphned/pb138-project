import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { StubPage } from "@/components/dev/StubPage";
import { useDeleteEventsByIdImagesByImageId } from "@/generated/hooks/useDeleteEventsByIdImagesByImageId";
import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { usePostEventsByIdImages } from "@/generated/hooks/usePostEventsByIdImages";

export const Route = createFileRoute("/events/$id/images")({
  component: EventsImagesStub,
});

function EventsImagesStub() {
  const { id } = Route.useParams();
  const query = useGetEventsByIdImages({ id });
  const uploadMutation = usePostEventsByIdImages();
  const deleteMutation = useDeleteEventsByIdImagesByImageId();
  return (
    <StubPage
      actorRole="winemaker (owner)"
      hookName="useGetEventsByIdImages + upload/delete"
      title={`Event ${id} images`}
    >
      <StubGet
        actorRole="winemaker (owner)"
        hookName="useGetEventsByIdImages"
        query={query}
        title="Existing images"
      />
      <StubMutation
        actorRole="winemaker (owner)"
        hookName="usePostEventsByIdImages"
        mutation={uploadMutation}
        payloadExample={{ data: { file: "BLOB_PLACEHOLDER" }, id }}
        title="Upload image"
      />
      <StubMutation
        actorRole="winemaker (owner)"
        hookName="useDeleteEventsByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
        title="Delete image"
      />
    </StubPage>
  );
}
