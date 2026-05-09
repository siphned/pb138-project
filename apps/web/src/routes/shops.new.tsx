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
      title="Create new shop"
      role="guest+ (shop_owner request)"
      hookName="usePostShops"
      mutation={mutation}
      payloadExample={{ data: { name: "My New Shop", city: "Brno", address: "Main St 1" } }}
    />
  );
}
