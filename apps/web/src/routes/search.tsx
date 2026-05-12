import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubPage } from "@/components/dev/StubPage";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetWines } from "@/generated/hooks/useGetWines";

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
    <StubPage actorRole="guest+" hookName="5 hooks composed in parallel" title={`Search "${q}"`}>
      <StubGet actorRole="guest+" hookName="useGetWines" query={winesQuery} title="Wines" />
      <StubGet
        actorRole="guest+"
        hookName="useGetProducts"
        query={productsQuery}
        title="Products"
      />
      <StubGet actorRole="guest+" hookName="useGetEvents" query={eventsQuery} title="Events" />
      <StubGet
        actorRole="guest+"
        hookName="useGetWinemakers"
        query={winemakersQuery}
        title="Winemakers"
      />
      <StubGet actorRole="guest+" hookName="useGetShops" query={shopsQuery} title="Shops" />
    </StubPage>
  );
}
