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
      title="Create new wine (type)"
      actorRole="winemaker"
      hookName="usePostWines"
      mutation={mutation}
      payloadExample={{ data: { name: "New Wine", color: "red", region: "South Moravia" } }}
    />
  );
}
