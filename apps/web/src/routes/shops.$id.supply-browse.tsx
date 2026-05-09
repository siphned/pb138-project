import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetSupplyAgreementsShopByShopId } from "@/generated/hooks/useGetSupplyAgreementsShopByShopId";
import { usePostSupplyAgreements } from "@/generated/hooks/usePostSupplyAgreements";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/shops/$id/supply-browse")({
  component: ShopsSupplyBrowseStub,
});

function ShopsSupplyBrowseStub() {
  const { id } = Route.useParams();
  const winemakersQuery = useGetWinemakers();
  const agreementsQuery = useGetSupplyAgreementsShopByShopId({ shopId: id });
  const mutation = usePostSupplyAgreements();
  return (
    <StubPage
      title={`Browse supply for shop ${id}`}
      actorRole="shop_owner (owner)"
      hookName="useGetWinemakers + useGetSupplyAgreementsShopByShopId + usePostSupplyAgreements"
    >
      <StubGet
        title="Existing agreements"
        actorRole="shop_owner (owner)"
        hookName="useGetSupplyAgreementsShopByShopId"
        query={agreementsQuery}
      />
      <StubGet
        title="Browse winemakers"
        actorRole="shop_owner (owner)"
        hookName="useGetWinemakers"
        query={winemakersQuery}
      />
      <StubMutation
        title="Propose agreement"
        actorRole="shop_owner (owner)"
        hookName="usePostSupplyAgreements"
        mutation={mutation}
        payloadExample={{ data: { shopId: id, winemakerId: "WINEMAKER_ID" } }}
      />
    </StubPage>
  );
}
