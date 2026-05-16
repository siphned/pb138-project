import { createFileRoute } from "@tanstack/react-router";
import { StubMutation } from "@/components/dev/StubMutation";
import { usePostShops } from "@/generated/hooks/usePostShops";

export const Route = createFileRoute("/shops/new")({
  component: ShopCreateStub,
});

function ShopCreateStub() {
  const mutation = usePostShops();
  return (
    <StubMutation
      actorRole="shop_owner"
      hookName="usePostShops"
      mutation={mutation}
      payloadExample={{
        data: {
          address: {
            city: "Brno",
            country: "Czech Republic",
            houseNumber: "1",
            postalCode: "60200",
            street: "Main St",
          },
          description: "Local wine shop in Brno.",
          name: "My New Shop",
        },
      }}
      title="Create new shop"
    />
  );
}
