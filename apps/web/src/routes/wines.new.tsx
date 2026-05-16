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
      payloadExample={{
        data: {
          alcoholContent: "12.5",
          attribution: "Lechovice 2022",
          color: "red",
          composition: "Pinot Noir 100%",
          description: "A medium-bodied red wine with notes of cherry and oak.",
          name: "New Wine",
          quantity: 100,
          region: "South Moravia",
          type: "still",
          vintageYear: 2022,
          volumeMl: 750,
        },
      }}
      title="Create new wine (type)"
    />
  );
}
