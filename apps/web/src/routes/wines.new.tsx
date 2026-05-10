import { createFileRoute } from "@tanstack/react-router";
import { StubMutation } from "@/components/dev/StubMutation";
import { usePostWines } from "@/generated/hooks/usePostWines";

export const Route = createFileRoute("/wines/new")({
  component: WineCreateStub,
});

function WineCreateStub() {
  const mutation = usePostWines();
  return (
    <StubMutation
      actorRole="winemaker"
      hookName="usePostWines"
      mutation={mutation}
      payloadExample={{ data: { color: "red", name: "New Wine", region: "South Moravia" } }}
      title="Create new wine (type)"
    />
  );
}
