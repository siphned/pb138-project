import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";

export const Route = createFileRoute("/winemakers/")({
  component: WinemakersListStub,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
});

function WinemakersListStub() {
  const search = Route.useSearch();
  const query = useGetWinemakers(search);
  return (
    <StubGet
      title={`All winemakers${Object.keys(search).length ? " (filtered)" : ""}`}
      role="guest+"
      hookName="useGetWinemakers"
      query={query}
    />
  );
}
