import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";
import { usePostShopsByIdImages } from "@/generated/hooks/usePostShopsByIdImages";
import { useDeleteShopsByIdImagesByImageId } from "@/generated/hooks/useDeleteShopsByIdImagesByImageId";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/shops/$id/images")({
  component: ShopsImagesStub,
});

function ShopsImagesStub() {
  const { id } = Route.useParams();
  const query = useGetShopsByIdImages({ id });
  const uploadMutation = usePostShopsByIdImages();
  const deleteMutation = useDeleteShopsByIdImagesByImageId();
  return (
    <StubPage
      title={`Shop ${id} images`}
      actorRole="shop_owner (owner)"
      hookName="useGetShopsByIdImages + upload/delete"
    >
      <StubGet
        title="Existing images"
        actorRole="shop_owner (owner)"
        hookName="useGetShopsByIdImages"
        query={query}
      />
      <StubMutation
        title="Upload image"
        actorRole="shop_owner (owner)"
        hookName="usePostShopsByIdImages"
        mutation={uploadMutation}
        payloadExample={{ id, data: { file: "BLOB_PLACEHOLDER" } }}
      />
      <StubMutation
        title="Delete image"
        actorRole="shop_owner (owner)"
        hookName="useDeleteShopsByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
      />
    </StubPage>
  );
}
