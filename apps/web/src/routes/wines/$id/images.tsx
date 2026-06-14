import { createFileRoute } from "@tanstack/react-router";
import { useDeleteWinesByIdImagesByImageId } from "@/generated/hooks/useDeleteWinesByIdImagesByImageId";
import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import { usePostWinesByIdImages } from "@/generated/hooks/usePostWinesByIdImages";
import { StubGet } from "@/routes/-components/StubGet";
import { StubMutation } from "@/routes/-components/StubMutation";
import { StubPage } from "@/routes/-components/StubPage";

export const Route = createFileRoute("/wines/$id/images")({
  component: WinesImagesStub,
});

function WinesImagesStub() {
  const { id } = Route.useParams();
  const query = useGetWinesByIdImages(id);
  const uploadMutation = usePostWinesByIdImages();
  const deleteMutation = useDeleteWinesByIdImagesByImageId();
  return (
    <StubPage
      actorRole="winemaker (owner)"
      hookName="useGetWinesByIdImages + upload/delete"
      title={`Wine ${id} images`}
    >
      <StubGet
        actorRole="winemaker (owner)"
        hookName="useGetWinesByIdImages"
        query={query}
        title="Existing images"
      />
      <StubMutation
        actorRole="winemaker (owner)"
        hookName="usePostWinesByIdImages"
        mutation={uploadMutation}
        payloadExample={{ data: { file: new Blob(["BLOB_PLACEHOLDER"]) }, id }}
        title="Upload image"
      />
      <StubMutation
        actorRole="winemaker (owner)"
        hookName="useDeleteWinesByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
        title="Delete image"
      />
    </StubPage>
  );
}
