import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/winemakers/$id/edit")({
  component: WinemakerEditStub,
});

function WinemakerEditStub() {
  return (
    <StubPage title="Edit winemaker" role="admin / winemaker" hookName="usePatchWinemakersById (MISSING BE)">
      <p className="text-destructive">
        Mutation hook <code>usePatchWinemakersById</code> not present in generated client.
        Backend endpoint missing or Orval has not regenerated. Recorded in audit.
      </p>
    </StubPage>
  );
}
