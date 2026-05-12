import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetSupplyAgreementsWinemaker } from "@/generated/hooks/useGetSupplyAgreementsWinemaker";

export const Route = createFileRoute("/shops/$id/supply-incoming")({
  component: ShopsSupplyIncomingStub,
});

function ShopsSupplyIncomingStub() {
  const query = useGetSupplyAgreementsWinemaker();
  return (
    <StubGet
      actorRole="winemaker (owner)"
      hookName="useGetSupplyAgreementsWinemaker"
      query={query}
      title="Incoming supply agreement requests"
    />
  );
}
