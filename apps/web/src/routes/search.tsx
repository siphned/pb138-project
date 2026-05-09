import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetShops } from "@/generated/hooks/useGetShops";

export const Route = createFileRoute("/search")({
  component: SearchStub,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
});

function SearchStub() {
  const { q } = Route.useSearch();
  const winesQuery = useGetWines({ q });
  const productsQuery = useGetProducts({ q });
  const eventsQuery = useGetEvents({ q });
  const winemakersQuery = useGetWinemakers({ q });
  const shopsQuery = useGetShops({ q });
  return (
    <StubPage
      title={`Search "${q}"`}
      actorRole="guest+"
      hookName="5 hooks composed in parallel"
    >
      <StubGet title="Wines" actorRole="guest+" hookName="useGetWines" query={winesQuery} />
      <StubGet title="Products" actorRole="guest+" hookName="useGetProducts" query={productsQuery} />
      <StubGet title="Events" actorRole="guest+" hookName="useGetEvents" query={eventsQuery} />
      <StubGet title="Winemakers" actorRole="guest+" hookName="useGetWinemakers" query={winemakersQuery} />
      <StubGet title="Shops" actorRole="guest+" hookName="useGetShops" query={shopsQuery} />
    </StubPage>
  );
}
