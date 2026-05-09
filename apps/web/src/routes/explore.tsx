import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWines } from "@/generated/hooks/useGetWines";

export const Route = createFileRoute("/explore")({
  component: ExploreStub,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    color: typeof search.color === "string" ? search.color : undefined,
    region: typeof search.region === "string" ? search.region : undefined,
    winemakerId: typeof search.winemakerId === "string" ? search.winemakerId : undefined,
  }),
});

function ExploreStub() {
  const search = Route.useSearch();
  const query = useGetWines(search);
  return (
    <StubGet
      title={`Explore wine types${Object.keys(search).length ? " (filtered)" : ""}`}
      role="guest+"
      hookName="useGetWines"
      query={query}
    />
  );
}
