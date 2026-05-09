import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { usePostWinemakersByIdImages } from "@/generated/hooks/usePostWinemakersByIdImages";
import { useDeleteWinemakersByIdImagesByImageId } from "@/generated/hooks/useDeleteWinemakersByIdImagesByImageId";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/winemakers/$id/images")({
  component: WinemakersImagesStub,
});

function WinemakersImagesStub() {
  const { id } = Route.useParams();
  const query = useGetWinemakersByIdImages({ id });
  const uploadMutation = usePostWinemakersByIdImages();
  const deleteMutation = useDeleteWinemakersByIdImagesByImageId();
  return (
    <StubPage
      title={`Winemaker ${id} images`}
      actorRole="winemaker (owner)"
      hookName="useGetWinemakersByIdImages + upload/delete"
    >
      <StubGet
        title="Existing images"
        actorRole="winemaker (owner)"
        hookName="useGetWinemakersByIdImages"
        query={query}
      />
      <StubMutation
        title="Upload image"
        actorRole="winemaker (owner)"
        hookName="usePostWinemakersByIdImages"
        mutation={uploadMutation}
        payloadExample={{ id, data: { file: "BLOB_PLACEHOLDER" } }}
      />
      <StubMutation
        title="Delete image"
        actorRole="winemaker (owner)"
        hookName="useDeleteWinemakersByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
      />
    </StubPage>
  );
}
