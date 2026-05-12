import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { StubPage } from "@/components/dev/StubPage";
import { useDeleteShopsByIdImagesByImageId } from "@/generated/hooks/useDeleteShopsByIdImagesByImageId";
import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";
import { usePostShopsByIdImages } from "@/generated/hooks/usePostShopsByIdImages";

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
      actorRole="shop_owner (owner)"
      hookName="useGetShopsByIdImages + upload/delete"
      title={`Shop ${id} images`}
    >
      <StubGet
        actorRole="shop_owner (owner)"
        hookName="useGetShopsByIdImages"
        query={query}
        title="Existing images"
      />
      <StubMutation
        actorRole="shop_owner (owner)"
        hookName="usePostShopsByIdImages"
        mutation={uploadMutation}
        payloadExample={{ data: { file: "BLOB_PLACEHOLDER" }, id }}
        title="Upload image"
      />
      <StubMutation
        actorRole="shop_owner (owner)"
        hookName="useDeleteShopsByIdImagesByImageId"
        mutation={deleteMutation}
        payloadExample={{ id, imageId: "REPLACE_WITH_IMAGE_ID" }}
        title="Delete image"
      />
    </StubPage>
  );
}
