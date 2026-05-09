import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWines } from "@/generated/hooks/useGetWines";

export const Route = createFileRoute("/wines/")({
  component: WinesListStub,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    color: typeof search.color === "string" ? search.color : undefined,
    region: typeof search.region === "string" ? search.region : undefined,
    winemakerId: typeof search.winemakerId === "string" ? search.winemakerId : undefined,
  }),
});

function WinesListStub() {
  const search = Route.useSearch();
  const query = useGetWines(search);
  return (
    <StubGet
      title={`All wines${Object.keys(search).length ? " (filtered)" : ""}`}
      actorRole="guest+"
      hookName="useGetWines"
      query={query}
    />
  );
}
