import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { StubPage } from "@/components/dev/StubPage";
import { useGetSupplyAgreementsShopByShopId } from "@/generated/hooks/useGetSupplyAgreementsShopByShopId";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { usePostSupplyAgreements } from "@/generated/hooks/usePostSupplyAgreements";

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
      actorRole="shop_owner (owner)"
      hookName="useGetWinemakers + useGetSupplyAgreementsShopByShopId + usePostSupplyAgreements"
      title={`Browse supply for shop ${id}`}
    >
      <StubGet
        actorRole="shop_owner (owner)"
        hookName="useGetSupplyAgreementsShopByShopId"
        query={agreementsQuery}
        title="Existing agreements"
      />
      <StubGet
        actorRole="shop_owner (owner)"
        hookName="useGetWinemakers"
        query={winemakersQuery}
        title="Browse winemakers"
      />
      <StubMutation
        actorRole="shop_owner (owner)"
        hookName="usePostSupplyAgreements"
        mutation={mutation}
        payloadExample={{ data: { shopId: id, winemakerId: "WINEMAKER_ID" } }}
        title="Propose agreement"
      />
    </StubPage>
  );
}
