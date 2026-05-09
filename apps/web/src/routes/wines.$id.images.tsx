import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import { usePostWinesByIdImages } from "@/generated/hooks/usePostWinesByIdImages";
import { useDeleteWinesByIdImagesByImageId } from "@/generated/hooks/useDeleteWinesByIdImagesByImageId";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/wines/$id/images")({
  component: WinesImagesStub,
});

function WinesImagesStub() {
  const { id } = Route.useParams();
  const query = useGetWinesByIdImages({ id });
  const uploadMutation = usePostWinesByIdImages();
  const deleteMutation = useDeleteWinesByIdImagesByImageId();
  return (
    <StubPage
      title={`Wine ${id} images`}
      role="winemaker (owner)"
      hookName="useGetWinesByIdImages + upload/delete"
    >
      <StubGet
        title="Existing images"
        role="winemaker (owner)"
        hookName="useGetWinesByIdImages"
        query={query}
      />
      <StubMutation
        title="Upload image"
        role="winemaker (owner)"
        hookName="usePostWinesByIdImages"
        mutation={uploadMutation}
        payloadExample={{ id, data: { file: "BLOB_PLACEHOLDER" } }}
      />
      <StubMutation
        title="Delete image"
        role="winemaker (owner)"
        hookName="useDeleteWinesByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
      />
    </StubPage>
  );
}
