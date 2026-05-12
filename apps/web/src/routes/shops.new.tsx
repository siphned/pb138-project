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
      actorRole="guest+ (shop_owner request)"
      hookName="usePostShops"
      mutation={mutation}
      payloadExample={{ data: { address: "Main St 1", city: "Brno", name: "My New Shop" } }}
      title="Create new shop"
    />
  );
}
