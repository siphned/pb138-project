import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWines } from "@/generated/hooks/useGetWines";

export const Route = createFileRoute("/wines/")({
  component: WinesListStub,
  validateSearch: (search) => ({
    color: typeof search.color === "string" ? search.color : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    region: typeof search.region === "string" ? search.region : undefined,
    winemakerId: typeof search.winemakerId === "string" ? search.winemakerId : undefined,
  }),
});

function WinesListStub() {
  const search = Route.useSearch();
  const query = useGetWines(search);
  return (
    <StubGet
      actorRole="guest+"
      hookName="useGetWines"
      query={query}
      title={`All wines${Object.keys(search).length ? " (filtered)" : ""}`}
    />
  );
}
