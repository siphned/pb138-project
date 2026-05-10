import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/shops/$id/edit")({
  component: ShopsEditStub,
});

function ShopsEditStub() {
  return (
    <StubPage
      actorRole="shop_owner (owner)"
      hookName="useGetShopsById + usePutShopsById + useDeleteShopsById (MISSING BE)"
      title="Edit shop"
    >
      <p className="text-destructive">
        Mutation hooks <code>usePutShopsById</code> and <code>useDeleteShopsById</code> not present
        in generated client. Backend endpoint missing or Orval has not regenerated. Recorded in
        audit.
      </p>
    </StubPage>
  );
}
