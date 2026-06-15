import { createFileRoute } from "@tanstack/react-router";
import { useDeleteWinemakersByIdImagesByImageId } from "@/generated/hooks/useDeleteWinemakersByIdImagesByImageId";
import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { usePostWinemakersByIdImages } from "@/generated/hooks/usePostWinemakersByIdImages";
import { StubGet } from "@/routes/-components/StubGet";
import { StubMutation } from "@/routes/-components/StubMutation";
import { StubPage } from "@/routes/-components/StubPage";

export const Route = createFileRoute("/winemakers/$id/images")({
  component: WinemakersImagesStub,
});

function WinemakersImagesStub() {
  const { id } = Route.useParams();
  const query = useGetWinemakersByIdImages(id);
  const uploadMutation = usePostWinemakersByIdImages();
  const deleteMutation = useDeleteWinemakersByIdImagesByImageId();
  return (
    <StubPage
      actorRole="winemaker (owner)"
      hookName="useGetWinemakersByIdImages + upload/delete"
      title={`Winemaker ${id} images`}
    >
      <StubGet
        actorRole="winemaker (owner)"
        hookName="useGetWinemakersByIdImages"
        query={query}
        title="Existing images"
      />
      <StubMutation
        actorRole="winemaker (owner)"
        hookName="usePostWinemakersByIdImages"
        mutation={uploadMutation}
        payloadExample={{ data: { file: new Blob(["BLOB_PLACEHOLDER"]) }, id }}
        title="Upload image"
      />
      <StubMutation
        actorRole="winemaker (owner)"
        hookName="useDeleteWinemakersByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
        title="Delete image"
      />
    </StubPage>
  );
}
