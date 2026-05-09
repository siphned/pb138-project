import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { usePostEventsByIdImages } from "@/generated/hooks/usePostEventsByIdImages";
import { useDeleteEventsByIdImagesByImageId } from "@/generated/hooks/useDeleteEventsByIdImagesByImageId";
import { StubPage } from "@/components/dev/StubPage";

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
      title={`Event ${id} images`}
      role="winemaker (owner)"
      hookName="useGetEventsByIdImages + upload/delete"
    >
      <StubGet
        title="Existing images"
        role="winemaker (owner)"
        hookName="useGetEventsByIdImages"
        query={query}
      />
      <StubMutation
        title="Upload image"
        role="winemaker (owner)"
        hookName="usePostEventsByIdImages"
        mutation={uploadMutation}
        payloadExample={{ id, data: { file: "BLOB_PLACEHOLDER" } }}
      />
      <StubMutation
        title="Delete image"
        role="winemaker (owner)"
        hookName="useDeleteEventsByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
      />
    </StubPage>
  );
}
