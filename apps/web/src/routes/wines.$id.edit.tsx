import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/wines/$id/edit")({
  component: WineEditStub,
});

function WineEditStub() {
  return (
    <StubPage title="Edit wine (current data)" actorRole="winemaker" hookName="usePatchWinesById (MISSING BE)">
      <p className="text-destructive">
        Mutation hook <code>usePatchWinesById</code> not present in generated client.
        Backend endpoint missing or Orval has not regenerated. Recorded in audit.
      </p>
    </StubPage>
  );
}
